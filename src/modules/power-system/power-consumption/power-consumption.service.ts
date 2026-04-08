import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PowerComputeJobStatus } from '@app-types/power-system/power-task.types';
import { Repository } from 'typeorm';
import { ActualPowerConsumptionEntity } from './actual-power-consumption.entity';
import { ForecastPowerConsumptionEntity } from './forecast-power-consumption.entity';
import {
  POWER_CONSUMPTION_INTERVALS,
  POWER_CONSUMPTION_SUPPORTED_COMPANIES,
} from './power-consumption.constants';
import type {
  IntervalSummaryAggregateRow,
  PowerCompanyJobRecord,
  PowerCompanyJobsFilters,
  PowerDailySummaryAggregateRow,
  PowerDailySummaryFilters,
  PowerForecastReportRow,
  PowerConsumptionMissingDatesResult,
  PowerIntervalSummaryFilters,
} from './power-consumption.types';
import { PowerTaskSummaryEntity } from './power-task-summary.entity';

@Injectable()
export class PowerConsumptionService {
  constructor(
    @InjectRepository(ActualPowerConsumptionEntity)
    private readonly actualPowerConsumptionRepository: Repository<ActualPowerConsumptionEntity>,
    @InjectRepository(ForecastPowerConsumptionEntity)
    private readonly forecastPowerConsumptionRepository: Repository<ForecastPowerConsumptionEntity>,
    @InjectRepository(PowerTaskSummaryEntity)
    private readonly powerTaskSummaryRepository: Repository<PowerTaskSummaryEntity>,
  ) {}

  async createTaskSummary(input: {
    readonly taskName: string | null;
    readonly createdBy: string;
    readonly startedAt: Date;
  }): Promise<PowerTaskSummaryEntity> {
    const entity = this.powerTaskSummaryRepository.create({
      taskName: input.taskName,
      status: 'created',
      startTime: input.startedAt,
      endTime: null,
      uploadSummary: {},
      computeSummary: {},
      errorMessage: null,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
    });

    return await this.powerTaskSummaryRepository.save(entity);
  }

  async markTaskUploading(taskId: number): Promise<void> {
    const entity = await this.requireTaskSummary(taskId);
    entity.status = 'uploading';
    entity.updatedBy = 'system';
    await this.powerTaskSummaryRepository.save(entity);
  }

  async finalizeTaskUpload(input: {
    readonly taskId: number;
    readonly uploadSummary: Record<string, unknown>;
    readonly uploadFailed: boolean;
  }): Promise<void> {
    const entity = await this.requireTaskSummary(input.taskId);
    entity.uploadSummary = input.uploadSummary;
    entity.status = 'uploaded';
    entity.updatedBy = 'system';
    entity.errorMessage = input.uploadFailed
      ? appendTaskErrorMessage(entity.errorMessage, '部分文件上传或数据入库失败。')
      : entity.errorMessage;

    await this.powerTaskSummaryRepository.save(entity);
  }

  async initializeTaskComputeSummary(input: {
    readonly taskId: number;
    readonly companyDates: ReadonlyMap<string, ReadonlySet<string>>;
    readonly initializedAt: Date;
  }): Promise<void> {
    const entity = await this.requireTaskSummary(input.taskId);
    const jobs = await this.selectForecastJobs(input.companyDates);

    entity.computeSummary = {
      start_time: input.initializedAt.toISOString(),
      end_time: jobs.length === 0 ? input.initializedAt.toISOString() : null,
      total_jobs: jobs.length,
      successful_jobs: 0,
      failed_jobs: 0,
      progress: 0,
      jobs: jobs.map((job) => ({
        company_name: job.companyName,
        predicted_date: job.predictedDate,
        status: 'not_started',
      })),
    };

    if (jobs.length === 0) {
      entity.status = 'completed';
      entity.endTime = input.initializedAt;
      entity.errorMessage = appendTaskErrorMessage(
        entity.errorMessage,
        '上传数据不足，未能启动新的预测任务。',
      );
    } else {
      entity.status = 'computing';
    }

    entity.updatedBy = 'system';
    await this.powerTaskSummaryRepository.save(entity);
  }

  async upsertActualPowerRows(rows: readonly ActualPowerUpsertRow[]): Promise<ActualUpsertResult> {
    const result: ActualUpsertResult = {
      inserted: 0,
      updated: 0,
      companyDates: new Map<string, Set<string>>(),
    };

    for (const row of rows) {
      const existing = await this.actualPowerConsumptionRepository.findOne({
        where: {
          accountNumber: row.accountNumber,
          recordDate: row.recordDate,
        },
      });

      if (existing) {
        applyActualRowToEntity(existing, row);
        existing.updatedBy = 'admin';
        await this.actualPowerConsumptionRepository.save(existing);
        result.updated += 1;
      } else {
        const entity = this.actualPowerConsumptionRepository.create({
          sellerCompanyName: row.sellerCompanyName,
          retailUserName: row.retailUserName,
          accountNumber: row.accountNumber,
          recordDate: row.recordDate,
          dailyTotalEnergyKwh: row.dailyTotalEnergyKwh,
          createdBy: 'admin',
          updatedBy: 'admin',
        });
        applyActualRowToEntity(entity, row);
        await this.actualPowerConsumptionRepository.save(entity);
        result.inserted += 1;
      }

      const existingDates = result.companyDates.get(row.retailUserName) ?? new Set<string>();
      existingDates.add(row.recordDate);
      result.companyDates.set(row.retailUserName, existingDates);
    }

    return result;
  }

  async listDistinctRetailUserNames(): Promise<string[]> {
    const rows = await this.actualPowerConsumptionRepository
      .createQueryBuilder('actualPowerConsumption')
      .select('actualPowerConsumption.retailUserName', 'retailUserName')
      .where('actualPowerConsumption.retailUserName IS NOT NULL')
      .distinct(true)
      .orderBy('actualPowerConsumption.retailUserName', 'ASC')
      .getRawMany<{ retailUserName: string | null }>();

    return rows.map((row) => row.retailUserName?.trim() ?? '').filter((name) => name.length > 0);
  }

  async listActualDailyTotals(
    filters: PowerDailySummaryFilters,
  ): Promise<PowerDailySummaryAggregateRow[]> {
    const qb = this.actualPowerConsumptionRepository
      .createQueryBuilder('actualPowerConsumption')
      .select('actualPowerConsumption.recordDate', 'recordDate')
      .addSelect('SUM(COALESCE(actualPowerConsumption.dailyTotalEnergyKwh, 0))', 'totalEnergyKwh')
      .where('actualPowerConsumption.recordDate >= :startDate', {
        startDate: filters.startDate,
      })
      .andWhere('actualPowerConsumption.recordDate <= :endDate', {
        endDate: filters.endDate,
      });

    if (filters.companyName !== '--全部--') {
      qb.andWhere('actualPowerConsumption.retailUserName = :companyName', {
        companyName: filters.companyName,
      });
    }

    const rows = await qb
      .groupBy('actualPowerConsumption.recordDate')
      .orderBy('actualPowerConsumption.recordDate', 'ASC')
      .getRawMany<{ recordDate: string | Date; totalEnergyKwh: string | number }>();

    return rows.map((row) => ({
      recordDate: normalizeRecordDate(row.recordDate),
      totalEnergyKwh: Number(row.totalEnergyKwh),
    }));
  }

  async listForecastDailyTotals(
    filters: PowerDailySummaryFilters,
  ): Promise<PowerDailySummaryAggregateRow[]> {
    const qb = this.forecastPowerConsumptionRepository
      .createQueryBuilder('forecastPowerConsumption')
      .select('forecastPowerConsumption.recordDate', 'recordDate')
      .addSelect('SUM(COALESCE(forecastPowerConsumption.dailyTotalEnergyKwh, 0))', 'totalEnergyKwh')
      .where('forecastPowerConsumption.recordDate >= :startDate', {
        startDate: filters.startDate,
      })
      .andWhere('forecastPowerConsumption.recordDate <= :endDate', {
        endDate: filters.endDate,
      });

    if (filters.companyName !== '--全部--') {
      qb.andWhere('forecastPowerConsumption.retailUserName = :companyName', {
        companyName: filters.companyName,
      });
    }

    const rows = await qb
      .groupBy('forecastPowerConsumption.recordDate')
      .orderBy('forecastPowerConsumption.recordDate', 'ASC')
      .getRawMany<{ recordDate: string | Date; totalEnergyKwh: string | number }>();

    return rows.map((row) => ({
      recordDate: normalizeRecordDate(row.recordDate),
      totalEnergyKwh: Number(row.totalEnergyKwh),
    }));
  }

  async listForecastReportRows(
    filters: PowerDailySummaryFilters,
  ): Promise<PowerForecastReportRow[]> {
    const qb = this.forecastPowerConsumptionRepository
      .createQueryBuilder('forecastPowerConsumption')
      .select('forecastPowerConsumption.retailUserName', 'companyName')
      .addSelect('forecastPowerConsumption.recordDate', 'recordDate')
      .where('forecastPowerConsumption.recordDate >= :startDate', {
        startDate: filters.startDate,
      })
      .andWhere('forecastPowerConsumption.recordDate <= :endDate', {
        endDate: filters.endDate,
      });

    if (filters.companyName !== '--全部--') {
      qb.andWhere('forecastPowerConsumption.retailUserName = :companyName', {
        companyName: filters.companyName,
      });
    }

    for (const interval of POWER_CONSUMPTION_INTERVALS) {
      qb.addSelect(`forecastPowerConsumption.${interval.propertyName}`, interval.propertyName);
    }

    const rows = await qb
      .orderBy('forecastPowerConsumption.recordDate', 'ASC')
      .addOrderBy('forecastPowerConsumption.retailUserName', 'ASC')
      .getRawMany<Record<string, string | number | Date | null>>();

    return rows
      .map((row) => ({
        companyName: typeof row.companyName === 'string' ? row.companyName.trim() : '',
        recordDate: normalizeRecordDate(row.recordDate as string | Date),
        values: POWER_CONSUMPTION_INTERVALS.reduce<Record<string, number | null>>(
          (acc, interval) => {
            const rawValue = row[interval.propertyName];
            acc[interval.propertyName] =
              rawValue === null || typeof rawValue === 'undefined' ? null : Number(rawValue);
            return acc;
          },
          {},
        ),
      }))
      .filter((row) => row.companyName.length > 0);
  }

  async listActualIntervalRows(
    filters: PowerIntervalSummaryFilters,
  ): Promise<IntervalSummaryAggregateRow[]> {
    return await this.listIntervalRows({
      repository: this.actualPowerConsumptionRepository,
      alias: 'actualPowerConsumption',
      filters,
    });
  }

  async listForecastIntervalRows(
    filters: PowerIntervalSummaryFilters,
  ): Promise<IntervalSummaryAggregateRow[]> {
    return await this.listIntervalRows({
      repository: this.forecastPowerConsumptionRepository,
      alias: 'forecastPowerConsumption',
      filters,
    });
  }

  async checkForecastMissingDates(
    filters: PowerIntervalSummaryFilters,
  ): Promise<PowerConsumptionMissingDatesResult> {
    const qb = this.forecastPowerConsumptionRepository
      .createQueryBuilder('forecastPowerConsumption')
      .select('forecastPowerConsumption.recordDate', 'recordDate')
      .where('forecastPowerConsumption.recordDate >= :startDate', {
        startDate: filters.startDate,
      })
      .andWhere('forecastPowerConsumption.recordDate <= :endDate', {
        endDate: filters.endDate,
      })
      .andWhere('forecastPowerConsumption.retailUserName = :companyName', {
        companyName: filters.companyName,
      })
      .distinct(true)
      .orderBy('forecastPowerConsumption.recordDate', 'ASC');

    const rows = await qb.getRawMany<{ recordDate: string | Date }>();
    return buildMissingDatesResult(filters.startDate, filters.endDate, rows);
  }

  async checkActualMissingDates(
    filters: PowerIntervalSummaryFilters,
  ): Promise<PowerConsumptionMissingDatesResult> {
    const qb = this.actualPowerConsumptionRepository
      .createQueryBuilder('actualPowerConsumption')
      .select('actualPowerConsumption.recordDate', 'recordDate')
      .where('actualPowerConsumption.recordDate >= :startDate', {
        startDate: filters.startDate,
      })
      .andWhere('actualPowerConsumption.recordDate <= :endDate', {
        endDate: filters.endDate,
      });

    if (filters.companyName !== '--全部--') {
      qb.andWhere('actualPowerConsumption.retailUserName = :companyName', {
        companyName: filters.companyName,
      });
    }

    const rows = await qb
      .distinct(true)
      .orderBy('actualPowerConsumption.recordDate', 'ASC')
      .getRawMany<{
        recordDate: string | Date;
      }>();
    return buildMissingDatesResult(filters.startDate, filters.endDate, rows);
  }

  async listCompanyJobs(filters: PowerCompanyJobsFilters): Promise<PowerCompanyJobRecord[]> {
    const tasks = await this.powerTaskSummaryRepository.find({
      where: { status: 'computing' },
      order: { taskId: 'ASC' },
    });

    const result: PowerCompanyJobRecord[] = [];
    for (const task of tasks) {
      const computeSummary = normalizeJsonObject(task.computeSummary);
      const jobsPayload = Array.isArray(computeSummary.jobs) ? computeSummary.jobs : [];

      for (const job of jobsPayload) {
        if (!isPlainObject(job) || job.company_name !== filters.companyName) {
          continue;
        }

        const status = normalizeComputeJobStatus(job.status);
        const predictedDate = normalizeIsoDate(job.predicted_date);
        if (!status || !predictedDate) {
          continue;
        }

        result.push({
          taskId: task.taskId,
          taskName: task.taskName,
          predictedDate,
          status,
          errorMessage: typeof job.error_message === 'string' ? job.error_message : null,
        });
      }
    }

    return result;
  }

  async findTaskSummaryById(taskId: number): Promise<PowerTaskSummaryEntity | null> {
    return await this.powerTaskSummaryRepository.findOne({
      where: { taskId },
    });
  }

  async getTaskSummaryOrThrow(taskId: number): Promise<PowerTaskSummaryEntity> {
    return await this.requireTaskSummary(taskId);
  }

  async saveTaskSummary(entity: PowerTaskSummaryEntity): Promise<PowerTaskSummaryEntity> {
    return await this.powerTaskSummaryRepository.save(entity);
  }

  async finalizeTaskPipelineWithFatalError(input: {
    readonly taskId: number;
    readonly message: string;
    readonly occurredAt: Date;
  }): Promise<void> {
    const entity = await this.findTaskSummaryById(input.taskId);
    if (!entity) {
      return;
    }

    const computeSummary = normalizeJsonObject(entity.computeSummary);
    computeSummary.end_time = input.occurredAt.toISOString();

    entity.computeSummary = computeSummary;
    entity.status = 'completed';
    entity.endTime = input.occurredAt;
    entity.updatedBy = 'system';
    entity.errorMessage = appendTaskErrorMessage(entity.errorMessage, input.message);

    await this.powerTaskSummaryRepository.save(entity);
  }

  async listActualHistoryForForecast(input: {
    readonly companyName: string;
    readonly forecastDate: string;
    readonly lookbackDays: number;
  }): Promise<ForecastHistoryDayRecord[]> {
    const forecastDate = parseDateStringToUtcDate(input.forecastDate);
    const lookbackStart = addUtcDays(forecastDate, -input.lookbackDays);
    const qb = this.actualPowerConsumptionRepository
      .createQueryBuilder('actualPowerConsumption')
      .select('actualPowerConsumption.recordDate', 'recordDate')
      .where('actualPowerConsumption.recordDate >= :lookbackStart', {
        lookbackStart: formatUtcDate(lookbackStart),
      })
      .andWhere('actualPowerConsumption.recordDate < :forecastDate', {
        forecastDate: input.forecastDate,
      });

    if (input.companyName !== '--全部--') {
      qb.andWhere('actualPowerConsumption.retailUserName = :companyName', {
        companyName: input.companyName,
      });
    }

    for (const interval of POWER_CONSUMPTION_INTERVALS) {
      qb.addSelect(
        `SUM(COALESCE(actualPowerConsumption.${interval.propertyName}, 0))`,
        interval.propertyName,
      );
    }

    const rows = await qb
      .groupBy('actualPowerConsumption.recordDate')
      .orderBy('actualPowerConsumption.recordDate', 'ASC')
      .getRawMany<Record<string, string | number | Date | null>>();

    return rows.map((row) => ({
      recordDate: normalizeRecordDate(row.recordDate as string | Date),
      values: POWER_CONSUMPTION_INTERVALS.map((interval) =>
        Number(row[interval.propertyName] ?? 0),
      ),
    }));
  }

  async upsertForecastSeries(input: {
    readonly companyName: string;
    readonly sellerCompanyName: string;
    readonly recordDate: string;
    readonly useDate: string;
    readonly prediction: readonly number[];
    readonly createdBy: string;
  }): Promise<void> {
    if (input.prediction.length !== POWER_CONSUMPTION_INTERVALS.length) {
      throw new Error('预测结果长度与 96 点位不一致');
    }

    const existing = await this.forecastPowerConsumptionRepository.findOne({
      where: {
        retailUserName: input.companyName,
        recordDate: input.recordDate,
      },
    });

    const entity =
      existing ??
      this.forecastPowerConsumptionRepository.create({
        retailUserName: input.companyName,
        recordDate: input.recordDate,
        createdBy: input.createdBy,
      });

    entity.sellerCompanyName = input.sellerCompanyName;
    entity.retailUserName = input.companyName;
    entity.recordDate = input.recordDate;
    entity.useDate = input.useDate;
    entity.dailyTotalEnergyKwh = input.prediction.reduce((sum, value) => sum + value, 0);
    entity.updatedBy = input.createdBy;

    const target = entity as unknown as Record<string, number | string | null>;
    for (const [index, interval] of POWER_CONSUMPTION_INTERVALS.entries()) {
      target[interval.propertyName] = input.prediction[index] ?? null;
    }

    await this.forecastPowerConsumptionRepository.save(entity);
  }

  private async listIntervalRows(params: {
    readonly repository:
      | Repository<ActualPowerConsumptionEntity>
      | Repository<ForecastPowerConsumptionEntity>;
    readonly alias: string;
    readonly filters: PowerIntervalSummaryFilters;
  }): Promise<IntervalSummaryAggregateRow[]> {
    const qb = params.repository
      .createQueryBuilder(params.alias)
      .select(`${params.alias}.recordDate`, 'recordDate')
      .where(`${params.alias}.recordDate >= :startDate`, {
        startDate: params.filters.startDate,
      })
      .andWhere(`${params.alias}.recordDate <= :endDate`, {
        endDate: params.filters.endDate,
      });

    if (params.filters.companyName !== '--全部--') {
      qb.andWhere(`${params.alias}.retailUserName = :companyName`, {
        companyName: params.filters.companyName,
      });
    }

    for (const interval of POWER_CONSUMPTION_INTERVALS) {
      qb.addSelect(
        `SUM(COALESCE(${params.alias}.${interval.propertyName}, 0))`,
        interval.propertyName,
      );
    }

    const rows = await qb
      .groupBy(`${params.alias}.recordDate`)
      .orderBy(`${params.alias}.recordDate`, 'ASC')
      .getRawMany<Record<string, string | number | Date | null>>();

    return rows.map((row) => ({
      recordDate: normalizeRecordDate(row.recordDate as string | Date),
      values: POWER_CONSUMPTION_INTERVALS.reduce<Record<string, number | null>>((acc, interval) => {
        const rawValue = row[interval.propertyName];
        acc[interval.propertyName] =
          rawValue === null || typeof rawValue === 'undefined' ? null : Number(rawValue);
        return acc;
      }, {}),
    }));
  }

  private async requireTaskSummary(taskId: number): Promise<PowerTaskSummaryEntity> {
    const entity = await this.findTaskSummaryById(taskId);
    if (!entity) {
      throw new Error(`Power task summary ${String(taskId)} not found`);
    }
    return entity;
  }

  private async selectForecastJobs(
    companyDates: ReadonlyMap<string, ReadonlySet<string>>,
  ): Promise<ForecastJobRecord[]> {
    const jobs: ForecastJobRecord[] = [];
    const jobKeys = new Set<string>();
    const aggregatedDates = new Set<string>();

    for (const companyName of Array.from(companyDates.keys()).sort((a, b) => a.localeCompare(b))) {
      if (!isSupportedForecastCompany(companyName)) {
        continue;
      }

      const dates = Array.from(companyDates.get(companyName) ?? []).sort();
      for (const filledDate of dates) {
        const filled = parseDateStringToUtcDate(filledDate);
        for (let offsetDays = 0; offsetDays < POWER_TASK_USE_DAYS; offsetDays += 1) {
          const checkStart = addUtcDays(filled, -offsetDays);
          const checkEnd = addUtcDays(checkStart, POWER_TASK_USE_DAYS - 1);
          const missing = await this.checkActualMissingDates({
            companyName,
            startDate: formatUtcDate(checkStart),
            endDate: formatUtcDate(checkEnd),
          });

          if (missing.hasMissingDates) {
            continue;
          }

          appendForecastJobsForWindow({
            companyName,
            checkEnd,
            jobs,
            jobKeys,
            aggregatedDates,
          });
        }
      }
    }

    for (const predictedDate of Array.from(aggregatedDates).sort()) {
      jobs.push({
        companyName: '--全部--',
        predictedDate,
      });
    }

    return jobs.sort(
      (left, right) =>
        left.predictedDate.localeCompare(right.predictedDate) ||
        left.companyName.localeCompare(right.companyName, 'zh-CN'),
    );
  }
}

function normalizeRecordDate(value: string | Date): string {
  if (value instanceof Date) {
    return `${value.getFullYear().toString().padStart(4, '0')}-${(value.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
  }

  return value.slice(0, 10);
}

function buildMissingDatesResult(
  startDate: string,
  endDate: string,
  rows: ReadonlyArray<{ recordDate: string | Date }>,
): PowerConsumptionMissingDatesResult {
  const availableDates = new Set(rows.map((row) => normalizeRecordDate(row.recordDate)));
  const missingDates = buildDateRange(startDate, endDate).filter(
    (date) => !availableDates.has(date),
  );

  return {
    hasMissingDates: missingDates.length > 0,
    missingDates,
  };
}

function buildDateRange(startDate: string, endDate: string): string[] {
  const result: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (cursor.getTime() <= end.getTime()) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
}

function normalizeJsonObject(value: unknown): Record<string, unknown> {
  if (isPlainObject(value)) {
    return value;
  }

  return {};
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeComputeJobStatus(input: unknown): PowerComputeJobStatus | null {
  if (input === 'not_started' || input === 'success' || input === 'failed') {
    return input;
  }

  return null;
}

function normalizeIsoDate(input: unknown): string | null {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return `${input.getFullYear().toString().padStart(4, '0')}-${(input.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${input.getDate().toString().padStart(2, '0')}`;
  }

  return null;
}

function applyActualRowToEntity(
  entity: ActualPowerConsumptionEntity,
  row: ActualPowerUpsertRow,
): void {
  entity.sellerCompanyName = row.sellerCompanyName;
  entity.retailUserName = row.retailUserName;
  entity.accountNumber = row.accountNumber;
  entity.recordDate = row.recordDate;
  entity.dailyTotalEnergyKwh = row.dailyTotalEnergyKwh;

  const target = entity as unknown as Record<string, number | string | null>;
  for (const interval of POWER_CONSUMPTION_INTERVALS) {
    target[interval.propertyName] = row.intervalValues[interval.propertyName] ?? null;
  }
}

function appendForecastJobsForWindow(params: {
  readonly companyName: string;
  readonly checkEnd: Date;
  readonly jobs: ForecastJobRecord[];
  readonly jobKeys: Set<string>;
  readonly aggregatedDates: Set<string>;
}): void {
  for (let horizon = 1; horizon <= POWER_TASK_FORECAST_DAYS; horizon += 1) {
    const predictedDate = formatUtcDate(addUtcDays(params.checkEnd, horizon));
    const jobKey = `${params.companyName}::${predictedDate}`;
    if (params.jobKeys.has(jobKey)) {
      continue;
    }

    params.jobKeys.add(jobKey);
    params.aggregatedDates.add(predictedDate);
    params.jobs.push({
      companyName: params.companyName,
      predictedDate,
    });
  }
}

function appendTaskErrorMessage(current: string | null, message: string): string {
  if (!current || current.trim().length === 0) {
    return message;
  }

  return `${current}${message}`;
}

function parseDateStringToUtcDate(input: string): Date {
  return new Date(`${input}T00:00:00.000Z`);
}

function addUtcDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatUtcDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function isSupportedForecastCompany(companyName: string): boolean {
  return POWER_CONSUMPTION_SUPPORTED_COMPANIES.includes(
    companyName as (typeof POWER_CONSUMPTION_SUPPORTED_COMPANIES)[number],
  );
}

const POWER_TASK_USE_DAYS = 10;
const POWER_TASK_FORECAST_DAYS = 5;

interface ForecastJobRecord {
  readonly companyName: string;
  readonly predictedDate: string;
}

export interface ActualPowerUpsertRow {
  readonly sellerCompanyName: string;
  readonly retailUserName: string;
  readonly accountNumber: string;
  readonly recordDate: string;
  readonly dailyTotalEnergyKwh: number;
  readonly intervalValues: Record<string, number | null>;
}

export interface ActualUpsertResult {
  inserted: number;
  updated: number;
  companyDates: Map<string, Set<string>>;
}

export interface ForecastHistoryDayRecord {
  readonly recordDate: string;
  readonly values: readonly number[];
}
