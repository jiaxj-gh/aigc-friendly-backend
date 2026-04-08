import { Injectable } from '@nestjs/common';
import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { PowerConsumptionQueryService } from '@modules/power-system/power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';
import { normalizeGeneratePowerReportInput } from './generate-power-report.input.normalize';

export interface GeneratePowerReportUsecaseParams {
  readonly companyName?: unknown;
  readonly startDate?: unknown;
  readonly endDate?: unknown;
}

export interface GeneratePowerReportUsecaseResult {
  readonly fileName: string;
  readonly contentType: string;
  readonly contentLength: number;
  readonly buffer: Buffer;
}

@Injectable()
export class GeneratePowerReportUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerConsumptionQueryService: PowerConsumptionQueryService,
  ) {}

  async execute(
    params: GeneratePowerReportUsecaseParams,
  ): Promise<GeneratePowerReportUsecaseResult> {
    const filters = normalizeGeneratePowerReportInput(params);
    const rows = await this.powerConsumptionService.listForecastReportRows(filters);
    if (rows.length === 0) {
      throw new DomainError(POWER_SYSTEM_ERROR.REPORT_NOT_FOUND, '当前预测数据不存在');
    }

    const csv = this.powerConsumptionQueryService.toForecastReportCsv({ rows });
    const buffer = Buffer.from(`\uFEFF${csv}`, 'utf8');
    const safeCompanyName = this.buildSafeCompanyName(filters.companyName);
    const fileName = `forecast_report_${safeCompanyName}_${this.formatTimestamp(new Date())}.csv`;

    return {
      fileName,
      contentType: 'text/csv; charset=utf-8',
      contentLength: buffer.byteLength,
      buffer,
    };
  }

  private buildSafeCompanyName(companyName: string): string {
    const sanitized = companyName.replace(/[\\/*?:"<>|]/g, '_');
    return sanitized.replace(/_/g, '').length > 0 ? sanitized : 'all_companies';
  }

  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
}
