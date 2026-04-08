import { Injectable } from '@nestjs/common';
import type {
  PowerCompanyJobRecord,
  PowerCompanyJobsFilters,
  PowerCompanyJobsView,
  PowerCompaniesView,
  PowerDailySummaryAggregateRow,
  PowerDailySummaryDayView,
  PowerDailySummaryFilters,
  PowerDailySummaryView,
  PowerForecastReportRow,
  IntervalSummaryAggregateRow,
  PowerIntervalSummaryFilters,
  PowerIntervalSummaryView,
  PowerTaskStatusView,
} from '../power-consumption.types';
import {
  POWER_CONSUMPTION_INTERVALS,
  POWER_CONSUMPTION_SUPPORTED_COMPANIES,
} from '../power-consumption.constants';
import { PowerTaskSummaryEntity } from '../power-task-summary.entity';

@Injectable()
export class PowerConsumptionQueryService {
  toPowerCompaniesView(companyNames: readonly string[]): PowerCompaniesView {
    const items = Array.from(new Set(companyNames))
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .sort((left, right) => left.localeCompare(right, 'zh-CN'));

    return {
      items: ['--全部--', ...items],
    };
  }

  toPowerDailySummaryView(params: {
    readonly filters: PowerDailySummaryFilters;
    readonly actualRows: readonly PowerDailySummaryAggregateRow[];
    readonly forecastRows: readonly PowerDailySummaryAggregateRow[];
  }): PowerDailySummaryView {
    const actualMap = new Map(
      params.actualRows.map((row) => [row.recordDate, row.totalEnergyKwh] as const),
    );
    const forecastMap = new Map(
      params.forecastRows.map((row) => [row.recordDate, row.totalEnergyKwh] as const),
    );

    const days: PowerDailySummaryDayView[] = [];
    for (const summaryDate of buildDateRange(params.filters.startDate, params.filters.endDate)) {
      const actualEnergyKwh = actualMap.has(summaryDate) ? actualMap.get(summaryDate)! : null;
      const forecastEnergyKwh = forecastMap.has(summaryDate) ? forecastMap.get(summaryDate)! : null;
      const forecastDeviation =
        forecastEnergyKwh !== null && forecastEnergyKwh !== 0 && actualEnergyKwh !== null
          ? ((forecastEnergyKwh - actualEnergyKwh) / forecastEnergyKwh) * 100
          : null;

      days.push({
        summaryDate,
        actualEnergyKwh,
        forecastEnergyKwh,
        forecastDeviation,
      });
    }

    return {
      companyName: params.filters.companyName,
      startDate: params.filters.startDate,
      endDate: params.filters.endDate,
      days,
    };
  }

  toPowerCompanyJobsView(params: {
    readonly filters: PowerCompanyJobsFilters;
    readonly jobs: readonly PowerCompanyJobRecord[];
  }): PowerCompanyJobsView {
    const jobs = [...params.jobs].sort(
      (left, right) =>
        left.predictedDate.localeCompare(right.predictedDate) || left.taskId - right.taskId,
    );

    return {
      companyName: params.filters.companyName,
      jobs,
      inProgress: jobs.some((job) => job.status === 'not_started'),
    };
  }

  toPowerTaskStatusView(task: PowerTaskSummaryEntity): PowerTaskStatusView {
    const uploadSummary = normalizeJsonObject(task.uploadSummary);
    const computeSummary = normalizeJsonObject(task.computeSummary);

    return {
      taskId: task.taskId,
      taskName: task.taskName,
      status: task.status,
      startTime: task.startTime,
      endTime: task.endTime,
      upload: {
        startTime: normalizeIsoDatetime(uploadSummary.start_time),
        endTime: normalizeIsoDatetime(uploadSummary.end_time),
        totalFiles: normalizeNonNegativeInteger(uploadSummary.total_files),
        uploadedFiles: normalizeNonNegativeInteger(uploadSummary.uploaded_files),
        failedFiles: normalizeNonNegativeInteger(uploadSummary.failed_files),
        files: normalizeUploadFiles(uploadSummary.files),
        companyDates: normalizeCompanyDates(uploadSummary.company_dates),
      },
      compute: {
        startTime: normalizeIsoDatetime(computeSummary.start_time),
        endTime: normalizeIsoDatetime(computeSummary.end_time),
        totalJobs: normalizeNonNegativeInteger(computeSummary.total_jobs),
        successfulJobs: normalizeNonNegativeInteger(computeSummary.successful_jobs),
        failedJobs: normalizeNonNegativeInteger(computeSummary.failed_jobs),
        progress: normalizeProgress(computeSummary.progress),
        jobs: normalizeComputeJobs(computeSummary.jobs),
      },
      errorMessage: normalizeNullableString(task.errorMessage),
    };
  }

  toForecastReportCsv(params: { readonly rows: readonly PowerForecastReportRow[] }): string {
    const header = [
      '公司名称',
      '日期',
      ...POWER_CONSUMPTION_INTERVALS.map((interval) => interval.timeLabel),
    ];
    const lines = [
      header.map(escapeCsvCell).join(','),
      ...params.rows.map((row) =>
        [
          row.companyName,
          row.recordDate,
          ...POWER_CONSUMPTION_INTERVALS.map((interval) =>
            formatCsvNumber(row.values[interval.propertyName]),
          ),
        ]
          .map(escapeCsvCell)
          .join(','),
      ),
    ];

    return lines.join('\n');
  }

  toPowerIntervalSummaryView(params: {
    readonly filters: PowerIntervalSummaryFilters;
    readonly actualRows: readonly IntervalSummaryAggregateRow[];
    readonly forecastRows: readonly IntervalSummaryAggregateRow[];
    readonly forecastMissingDates: readonly string[];
    readonly actualMissingDatesForLookback: readonly string[];
  }): PowerIntervalSummaryView {
    if (params.actualRows.length === 0 && params.forecastRows.length === 0) {
      return {
        companyName: params.filters.companyName,
        startDate: params.filters.startDate,
        endDate: params.filters.endDate,
        points: [],
        needUpload: true,
        forecastReport: '当前时间段无任何数据',
      };
    }

    const pointMap = new Map<string, MutablePowerIntervalSummaryPointView>();
    for (const row of params.actualRows) {
      for (const interval of POWER_CONSUMPTION_INTERVALS) {
        const timestamp = buildTimestamp(row.recordDate, interval.timeLabel);
        const timestampKey = timestamp.toISOString();
        const current =
          pointMap.get(timestampKey) ??
          ({
            timestamp,
            actualEnergyKwh: null,
            forecastEnergyKwh: null,
          } satisfies MutablePowerIntervalSummaryPointView);
        current.actualEnergyKwh = row.values[interval.propertyName];
        pointMap.set(timestampKey, current);
      }
    }

    for (const row of params.forecastRows) {
      for (const interval of POWER_CONSUMPTION_INTERVALS) {
        const timestamp = buildTimestamp(row.recordDate, interval.timeLabel);
        const timestampKey = timestamp.toISOString();
        const current =
          pointMap.get(timestampKey) ??
          ({
            timestamp,
            actualEnergyKwh: null,
            forecastEnergyKwh: null,
          } satisfies MutablePowerIntervalSummaryPointView);
        current.forecastEnergyKwh = row.values[interval.propertyName];
        pointMap.set(timestampKey, current);
      }
    }

    const points = Array.from(pointMap.values()).sort(
      (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
    );
    const needUpload = params.forecastMissingDates.length > 0;

    return {
      companyName: params.filters.companyName,
      startDate: params.filters.startDate,
      endDate: params.filters.endDate,
      points,
      needUpload,
      forecastReport: buildForecastReport({
        companyName: params.filters.companyName,
        forecastMissingDates: params.forecastMissingDates,
        actualMissingDatesForLookback: params.actualMissingDatesForLookback,
      }),
    };
  }
}

interface MutablePowerIntervalSummaryPointView {
  timestamp: Date;
  actualEnergyKwh: number | null;
  forecastEnergyKwh: number | null;
}

function normalizeJsonObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {};
}

function normalizeUploadFiles(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item): item is Record<string, unknown> => isPlainObject(item))
    .map((item) => ({
      fileId: normalizeString(item.file_id),
      name: normalizeString(item.name),
      size: normalizeNullableNonNegativeInteger(item.size),
      status: normalizeString(item.status),
      errorMessage: normalizeNullableString(item.error_message),
    }))
    .filter((item) => item.fileId.length > 0 && item.name.length > 0 && item.status.length > 0);
}

function normalizeCompanyDates(input: unknown) {
  if (!isPlainObject(input)) {
    return [];
  }

  return Object.entries(input)
    .filter(([companyName]) => companyName.trim().length > 0)
    .sort(([left], [right]) => left.localeCompare(right, 'zh-CN'))
    .map(([companyName, dates]) => ({
      companyName,
      dates: Array.isArray(dates)
        ? dates
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item))
            .sort()
        : [],
    }));
}

function normalizeComputeJobs(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item): item is Record<string, unknown> => isPlainObject(item))
    .map((item) => ({
      companyName: normalizeString(item.company_name),
      predictedDate: normalizeIsoDate(item.predicted_date),
      status: normalizeString(item.status),
      errorMessage: normalizeNullableString(item.error_message),
    }))
    .filter(
      (item) =>
        item.companyName.length > 0 && item.predictedDate.length > 0 && item.status.length > 0,
    )
    .sort(
      (left, right) =>
        left.predictedDate.localeCompare(right.predictedDate) ||
        left.companyName.localeCompare(right.companyName, 'zh-CN'),
    );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : '';
}

function normalizeNullableString(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeNonNegativeInteger(input: unknown): number {
  const parsed = typeof input === 'number' ? input : typeof input === 'string' ? Number(input) : 0;
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.trunc(parsed);
}

function normalizeNullableNonNegativeInteger(input: unknown): number | null {
  if (input === null || typeof input === 'undefined') {
    return null;
  }

  return normalizeNonNegativeInteger(input);
}

function normalizeProgress(input: unknown): number {
  const progress = normalizeNonNegativeInteger(input);
  return Math.min(progress, 100);
}

function normalizeIsoDate(input: unknown): string {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : '';
  }

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return input.toISOString().slice(0, 10);
  }

  return '';
}

function normalizeIsoDatetime(input: unknown): Date | null {
  if (typeof input === 'string') {
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return input;
  }

  return null;
}

function formatCsvNumber(value: number | null): string {
  if (value === null) {
    return '';
  }

  return String(value);
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
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

function buildTimestamp(recordDate: string, timeLabel: string): Date {
  const [year, month, day] = recordDate.split('-').map((value) => Number(value));
  const [hour, minute] = timeLabel.split(':').map((value) => Number(value));
  const timestamp = new Date(Date.UTC(year, month - 1, day, 0, minute, 0, 0));
  if (hour === 24) {
    timestamp.setUTCDate(timestamp.getUTCDate() + 1);
    return timestamp;
  }
  timestamp.setUTCHours(hour, minute, 0, 0);
  return timestamp;
}

function buildForecastReport(params: {
  readonly companyName: string;
  readonly forecastMissingDates: readonly string[];
  readonly actualMissingDatesForLookback: readonly string[];
}): string {
  if (
    !POWER_CONSUMPTION_SUPPORTED_COMPANIES.includes(
      params.companyName as (typeof POWER_CONSUMPTION_SUPPORTED_COMPANIES)[number],
    ) &&
    params.companyName !== '--全部--'
  ) {
    return `当前预测模型不支持此公司：${params.companyName}`;
  }

  return `${params.companyName}缺失预测日期为：${params.forecastMissingDates.join(', ')}\n待补充实际数据日期为：\n${params.actualMissingDatesForLookback.join('\n')}`;
}
