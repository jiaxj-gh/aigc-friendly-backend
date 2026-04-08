import { Injectable } from '@nestjs/common';
import { PowerPredictPort } from '@src/core/power-system/power-predict.port';
import {
  PowerConsumptionService,
  type ForecastHistoryDayRecord,
} from '@modules/power-system/power-consumption/power-consumption.service';
import { POWER_CONSUMPTION_INTERVALS } from '@modules/power-system/power-consumption/power-consumption.constants';
import type { PowerComputeJobStatus } from '@app-types/power-system/power-task.types';

export interface RunPowerTaskPipelineUsecaseParams {
  readonly taskId: number;
}

@Injectable()
export class RunPowerTaskPipelineUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerPredictApiClient: PowerPredictPort,
  ) {}

  async execute(params: RunPowerTaskPipelineUsecaseParams): Promise<void> {
    let taskIdForFatal = params.taskId;
    try {
      const task = await this.powerConsumptionService.getTaskSummaryOrThrow(params.taskId);
      taskIdForFatal = task.taskId;
      const plannedJobs = normalizeTaskJobs(task.computeSummary);

      if (plannedJobs.length === 0) {
        return;
      }

      const computeSummary = createComputeSummary(plannedJobs, task.computeSummary);
      task.status = 'computing';
      task.computeSummary = asJsonRecord(computeSummary);
      task.endTime = null;
      task.updatedBy = 'system';
      await this.powerConsumptionService.saveTaskSummary(task);

      for (const job of plannedJobs) {
        try {
          await this.executeForecastJob(job);
          markJobStatus(computeSummary, job, 'success', null);
        } catch (error) {
          markJobStatus(
            computeSummary,
            job,
            'failed',
            error instanceof Error ? error.message : '预测执行失败',
          );
        }

        refreshComputeProgress(computeSummary);
        task.computeSummary = asJsonRecord(computeSummary);
        task.updatedBy = 'system';
        await this.powerConsumptionService.saveTaskSummary(task);
      }

      computeSummary.end_time = new Date().toISOString();
      task.computeSummary = asJsonRecord(computeSummary);
      task.status = 'completed';
      task.endTime = new Date(computeSummary.end_time);
      task.updatedBy = 'system';
      task.errorMessage = appendTaskErrorMessage(
        task.errorMessage,
        computeSummary.failed_jobs > 0 ? '部分计算任务执行失败。' : null,
      );
      await this.powerConsumptionService.saveTaskSummary(task);
    } catch (error) {
      await this.powerConsumptionService.finalizeTaskPipelineWithFatalError({
        taskId: taskIdForFatal,
        message: error instanceof Error ? error.message : '预测任务执行失败',
        occurredAt: new Date(),
      });
      throw error;
    }
  }

  private async executeForecastJob(job: PlannedTaskJob): Promise<void> {
    const forecastDate = parseUtcDate(job.predictedDate);
    const history = await this.powerConsumptionService.listActualHistoryForForecast({
      companyName: job.companyName,
      forecastDate: job.predictedDate,
      lookbackDays: 15,
    });

    if (history.length === 0) {
      throw new Error('预测所需历史数据为空');
    }

    let selectedHistory: ForecastHistoryDayRecord[] | null = null;
    for (let offsetDays = 11; offsetDays <= 15; offsetDays += 1) {
      const candidateStart = addUtcDays(forecastDate, -offsetDays);
      const candidate = history.filter(
        (day) => compareIsoDate(day.recordDate, candidateStart) >= 0,
      );
      if (candidate.length < 10) {
        continue;
      }

      selectedHistory = candidate.slice(0, 10);
      break;
    }

    if (!selectedHistory) {
      throw new Error('未找到满足条件的连续 10 天历史数据');
    }

    const lastHistoricalDate = selectedHistory[selectedHistory.length - 1]?.recordDate;
    if (!lastHistoricalDate) {
      throw new Error('预测历史窗口缺失结束日期');
    }

    const prediction = await this.powerPredictApiClient.loadPredict({
      companyId: job.companyName === '--全部--' ? '总和' : job.companyName,
      lastHistoricalDate,
      historicalData: selectedHistory.flatMap((day) => day.values),
    });

    const deltaDays = diffUtcDays(forecastDate, parseUtcDate(lastHistoricalDate));
    if (deltaDays <= 0) {
      throw new Error('预测目标日期必须晚于历史结束日期');
    }

    const startIndex = (deltaDays - 1) * POWER_CONSUMPTION_INTERVALS.length;
    const endIndex = startIndex + POWER_CONSUMPTION_INTERVALS.length;
    const dayPrediction = prediction.slice(startIndex, endIndex);
    if (dayPrediction.length !== POWER_CONSUMPTION_INTERVALS.length) {
      throw new Error('预测接口返回长度不足，无法截取目标日期结果');
    }

    await this.powerConsumptionService.upsertForecastSeries({
      companyName: job.companyName,
      sellerCompanyName: '苏州中鑫新能源有限公司',
      recordDate: job.predictedDate,
      useDate: `${selectedHistory[0]?.recordDate ?? lastHistoricalDate}--${lastHistoricalDate}`,
      prediction: dayPrediction,
      createdBy: 'system',
    });
  }
}

interface PlannedTaskJob {
  readonly companyName: string;
  readonly predictedDate: string;
}

interface MutableComputeJob {
  company_name: string;
  predicted_date: string;
  status: PowerComputeJobStatus;
  error_message?: string | null;
}

interface MutableComputeSummary {
  start_time: string;
  end_time: string | null;
  total_jobs: number;
  successful_jobs: number;
  failed_jobs: number;
  progress: number;
  jobs: MutableComputeJob[];
}

function normalizeTaskJobs(value: unknown): PlannedTaskJob[] {
  const jobs = normalizeJsonArray(normalizeJsonObject(value).jobs);

  return jobs
    .map((item) => {
      if (!isPlainObject(item)) {
        return null;
      }

      const companyName = typeof item.company_name === 'string' ? item.company_name.trim() : '';
      const predictedDate =
        typeof item.predicted_date === 'string' ? item.predicted_date.trim() : '';

      if (companyName.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(predictedDate)) {
        return null;
      }

      return {
        companyName,
        predictedDate,
      };
    })
    .filter((item): item is PlannedTaskJob => item !== null)
    .sort(
      (left, right) =>
        left.predictedDate.localeCompare(right.predictedDate) ||
        left.companyName.localeCompare(right.companyName, 'zh-CN'),
    );
}

function createComputeSummary(
  plannedJobs: readonly PlannedTaskJob[],
  existing: unknown,
): MutableComputeSummary {
  const summary = normalizeJsonObject(existing);
  const startTime =
    typeof summary.start_time === 'string' && summary.start_time.trim().length > 0
      ? summary.start_time.trim()
      : new Date().toISOString();

  return {
    start_time: startTime,
    end_time: null,
    total_jobs: plannedJobs.length,
    successful_jobs: 0,
    failed_jobs: 0,
    progress: 0,
    jobs: plannedJobs.map((job) => ({
      company_name: job.companyName,
      predicted_date: job.predictedDate,
      status: 'not_started',
      error_message: null,
    })),
  };
}

function markJobStatus(
  summary: MutableComputeSummary,
  job: PlannedTaskJob,
  status: Exclude<PowerComputeJobStatus, 'not_started'>,
  errorMessage: string | null,
): void {
  const target = summary.jobs.find(
    (item) => item.company_name === job.companyName && item.predicted_date === job.predictedDate,
  );

  if (!target) {
    return;
  }

  target.status = status;
  target.error_message = errorMessage;
  if (status === 'success') {
    summary.successful_jobs += 1;
  } else {
    summary.failed_jobs += 1;
  }
}

function refreshComputeProgress(summary: MutableComputeSummary): void {
  if (summary.total_jobs <= 0) {
    summary.progress = 0;
    return;
  }

  const done = summary.successful_jobs + summary.failed_jobs;
  summary.progress = Math.floor((done * 100) / summary.total_jobs);
}

function appendTaskErrorMessage(current: string | null, message: string | null): string | null {
  if (!message || message.trim().length === 0) {
    return current;
  }

  if (!current || current.trim().length === 0) {
    return message;
  }

  return `${current}${message}`;
}

function normalizeJsonObject(value: unknown): Record<string, unknown> {
  if (isPlainObject(value)) {
    return value;
  }

  return {};
}

function normalizeJsonArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function addUtcDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function compareIsoDate(value: string, compareTo: Date): number {
  return value.localeCompare(formatUtcDate(compareTo));
}

function formatUtcDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function diffUtcDays(later: Date, earlier: Date): number {
  const ms = later.getTime() - earlier.getTime();
  return Math.round(ms / 86400000);
}

function asJsonRecord(value: MutableComputeSummary): Record<string, unknown> {
  return value as unknown as Record<string, unknown>;
}
