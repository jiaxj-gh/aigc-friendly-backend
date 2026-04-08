import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import path from 'path';
import type { PowerUploadFileStatus } from '@app-types/power-system/power-task.types';
import { POWER_CONSUMPTION_INTERVALS } from '@modules/power-system/power-consumption/power-consumption.constants';
import {
  PowerConsumptionService,
  type ActualPowerUpsertRow,
} from '@modules/power-system/power-consumption/power-consumption.service';
import {
  normalizeExecutePowerTaskInput,
  type ExecutePowerTaskUploadedFile,
} from './execute-power-task.input.normalize';

export interface ExecutePowerTaskUsecaseParams {
  readonly taskName?: unknown;
  readonly files?: unknown;
}

export interface ExecutePowerTaskUsecaseResult {
  readonly taskId: number;
  readonly uploadReport: string;
}

@Injectable()
export class ExecutePowerTaskUsecase {
  constructor(private readonly powerConsumptionService: PowerConsumptionService) {}

  async execute(params: ExecutePowerTaskUsecaseParams): Promise<ExecutePowerTaskUsecaseResult> {
    const input = normalizeExecutePowerTaskInput(params);
    const startedAt = new Date();
    const task = await this.powerConsumptionService.createTaskSummary({
      taskName: input.taskName ?? buildTaskName(startedAt),
      createdBy: 'system',
      startedAt,
    });

    await this.powerConsumptionService.markTaskUploading(task.taskId);

    const uploadStartedAt = new Date();
    const fileDetails: UploadFileDetail[] = [];
    const companyDates = new Map<string, Set<string>>();
    let uploadedFiles = 0;
    let failedFiles = 0;

    for (const file of input.files) {
      const detail = await this.processUploadedFile(file, companyDates);
      fileDetails.push(detail);
      if (detail.status === 'completed') {
        uploadedFiles += 1;
      } else {
        failedFiles += 1;
      }
    }

    const uploadEndedAt = new Date();
    const uploadSummary = {
      start_time: uploadStartedAt.toISOString(),
      end_time: uploadEndedAt.toISOString(),
      total_files: input.files.length,
      uploaded_files: uploadedFiles,
      failed_files: failedFiles,
      files: fileDetails.map((detail) => ({
        file_id: detail.fileId,
        name: detail.name,
        size: detail.size,
        status: detail.status,
        error_message: detail.errorMessage,
      })),
      company_dates: Object.fromEntries(
        Array.from(companyDates.entries())
          .sort(([left], [right]) => left.localeCompare(right, 'zh-CN'))
          .map(([companyName, dates]) => [companyName, Array.from(dates).sort()]),
      ),
    };

    await this.powerConsumptionService.finalizeTaskUpload({
      taskId: task.taskId,
      uploadSummary,
      uploadFailed: failedFiles > 0,
    });

    await this.powerConsumptionService.initializeTaskComputeSummary({
      taskId: task.taskId,
      companyDates,
      initializedAt: new Date(),
    });

    return {
      taskId: task.taskId,
      uploadReport: buildUploadReport(fileDetails),
    };
  }

  private async processUploadedFile(
    file: ExecutePowerTaskUploadedFile,
    companyDates: Map<string, Set<string>>,
  ): Promise<UploadFileDetail> {
    const detail: UploadFileDetail = {
      fileId: randomId(),
      name: file.originalName,
      size: file.buffer.length,
      status: 'not_started',
      errorMessage: null,
    };

    if (!file.originalName.toLowerCase().endsWith('.csv')) {
      detail.status = 'failed';
      detail.errorMessage = '不支持的文件类型';
      return detail;
    }

    if (file.buffer.length === 0) {
      detail.status = 'failed';
      detail.errorMessage = '获取文件内容为空';
      return detail;
    }

    let rows: ActualPowerUpsertRow[];
    try {
      rows = parseActualCsv(file.buffer);
    } catch (error) {
      detail.status = 'failed';
      detail.errorMessage = `CSV 解析失败: ${error instanceof Error ? error.message : '未知错误'}`;
      return detail;
    }

    let savedFilePath: string;
    try {
      savedFilePath = await saveUploadedFile(file.originalName, file.buffer);
    } catch (error) {
      detail.status = 'failed';
      detail.errorMessage = `文件保存失败: ${error instanceof Error ? error.message : '未知错误'}`;
      return detail;
    }

    try {
      const upsertResult = await this.powerConsumptionService.upsertActualPowerRows(rows);
      mergeCompanyDates(companyDates, upsertResult.companyDates);
    } catch (error) {
      await fs.rm(savedFilePath, { force: true });
      detail.status = 'failed';
      detail.errorMessage = `数据入库失败: ${error instanceof Error ? error.message : '未知错误'}`;
      return detail;
    }

    detail.status = 'completed';
    return detail;
  }
}

interface UploadFileDetail {
  readonly fileId: string;
  readonly name: string;
  readonly size: number;
  status: PowerUploadFileStatus;
  errorMessage: string | null;
}

function parseActualCsv(buffer: Buffer): ActualPowerUpsertRow[] {
  const records: Array<Record<string, unknown>> = parse(buffer, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const deduped = new Map<string, ActualPowerUpsertRow>();

  for (const record of records) {
    const row = normalizeActualRecord(record);
    if (!row) {
      continue;
    }

    deduped.set(`${row.accountNumber}::${row.recordDate}`, row);
  }

  return Array.from(deduped.values());
}

function normalizeActualRecord(record: Record<string, unknown>): ActualPowerUpsertRow | null {
  const sellerCompanyName = normalizeRequiredCell(
    pickRecordValue(record, ['售电公司名称', 'seller_company_name']),
  );
  const retailUserName = normalizeRequiredCell(
    pickRecordValue(record, ['零售用户名', 'retail_user_name']),
  );
  const accountNumber = normalizeRequiredCell(pickRecordValue(record, ['户号', 'account_number']));
  const recordDate = normalizeCsvDate(pickRecordValue(record, ['日期', 'record_date']));

  if (!sellerCompanyName || !retailUserName || !accountNumber || !recordDate) {
    return null;
  }

  const intervalValues = buildEmptyIntervalValues();
  const mappedTimeColumns = new Set<string>();

  for (const [header, value] of Object.entries(record)) {
    const normalizedLabel = canonicalizeTimeLabel(header);
    const targetInterval = POWER_CONSUMPTION_INTERVALS.find(
      (interval) => interval.timeLabel === normalizedLabel,
    );

    if (!targetInterval) {
      continue;
    }

    mappedTimeColumns.add(targetInterval.propertyName);
    intervalValues[targetInterval.propertyName] = normalizeIntervalValue(value);
  }

  for (const propertyName of mappedTimeColumns) {
    if (intervalValues[propertyName] === null) {
      return null;
    }
  }

  return {
    sellerCompanyName,
    retailUserName,
    accountNumber,
    recordDate,
    dailyTotalEnergyKwh: Object.values(intervalValues).reduce<number>(
      (sum, value) => sum + (value ?? 0),
      0,
    ),
    intervalValues,
  };
}

function buildEmptyIntervalValues(): Record<string, number | null> {
  return POWER_CONSUMPTION_INTERVALS.reduce<Record<string, number | null>>((acc, interval) => {
    acc[interval.propertyName] = null;
    return acc;
  }, {});
}

function pickRecordValue(record: Record<string, unknown>, candidates: readonly string[]): unknown {
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(record, candidate)) {
      return record[candidate];
    }
  }

  return undefined;
}

function normalizeRequiredCell(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCsvDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const normalized = value.trim().replace(/\//g, '-');
  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function canonicalizeTimeLabel(label: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(label.trim());
  if (!match) {
    return label;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = typeof match[3] === 'string' ? Number(match[3]) : 0;
  if (second !== 0) {
    return label;
  }

  if (hour === 24 && minute === 0) {
    return '24:00';
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function normalizeIntervalValue(value: unknown): number | null {
  if (typeof value === 'undefined' || value === null || value === '') {
    return null;
  }

  const normalized =
    typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : null;
  if (normalized === null) {
    throw new Error(`无效的时段电量值类型: ${typeof value}`);
  }

  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    throw new Error(`无效的时段电量值: ${normalized}`);
  }

  return parsed;
}

async function saveUploadedFile(originalName: string, buffer: Buffer): Promise<string> {
  const directory = path.resolve(process.cwd(), 'uploads', 'power-system', 'tasks');
  await fs.mkdir(directory, { recursive: true });
  const filePath = path.join(directory, buildSavedFileName(originalName, new Date(), randomId()));
  await fs.writeFile(filePath, buffer);
  return filePath;
}

function buildSavedFileName(originalName: string, now: Date, randomSuffix: string): string {
  const ext = path.extname(originalName) || '.csv';
  const baseName = path.basename(originalName, ext).trim().replace(/\s+/g, '_') || 'file';
  return `${baseName}_${formatCompactTimestamp(now)}_${randomSuffix}${ext}`;
}

function buildTaskName(now: Date): string {
  return `power_task_${formatCompactTimestamp(now)}`;
}

function formatCompactTimestamp(now: Date): string {
  return `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, '0')}${now
    .getUTCDate()
    .toString()
    .padStart(2, '0')}${now.getUTCHours().toString().padStart(2, '0')}${now
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}${now.getUTCSeconds().toString().padStart(2, '0')}`;
}

function mergeCompanyDates(
  target: Map<string, Set<string>>,
  source: ReadonlyMap<string, ReadonlySet<string>>,
): void {
  for (const [companyName, dates] of source.entries()) {
    const current = target.get(companyName) ?? new Set<string>();
    for (const date of dates) {
      current.add(date);
    }
    target.set(companyName, current);
  }
}

function buildUploadReport(fileDetails: readonly UploadFileDetail[]): string {
  return fileDetails
    .map((detail) => {
      const baseLine = `文件 ${detail.name}: 状态 ${detail.status}`;
      return detail.errorMessage ? `${baseLine}, 错误信息: ${detail.errorMessage}` : baseLine;
    })
    .join('\n');
}

function randomId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
