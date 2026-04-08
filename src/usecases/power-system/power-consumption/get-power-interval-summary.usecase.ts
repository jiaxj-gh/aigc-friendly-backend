import { Injectable } from '@nestjs/common';
import { PowerConsumptionQueryService } from '@modules/power-system/power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';
import type { PowerIntervalSummaryView } from '@modules/power-system/power-consumption/power-consumption.types';
import { normalizeGetPowerIntervalSummaryInput } from './get-power-interval-summary.input.normalize';

export interface GetPowerIntervalSummaryUsecaseParams {
  readonly companyName: string;
  readonly startDate: string;
  readonly endDate: string;
}

export type GetPowerIntervalSummaryUsecaseResult = PowerIntervalSummaryView;

@Injectable()
export class GetPowerIntervalSummaryUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerConsumptionQueryService: PowerConsumptionQueryService,
  ) {}

  async execute(
    params: GetPowerIntervalSummaryUsecaseParams,
  ): Promise<GetPowerIntervalSummaryUsecaseResult> {
    const filters = normalizeGetPowerIntervalSummaryInput(params);
    const [actualRows, forecastRows, forecastMissingDatesResult] = await Promise.all([
      this.powerConsumptionService.listActualIntervalRows(filters),
      this.powerConsumptionService.listForecastIntervalRows(filters),
      this.powerConsumptionService.checkForecastMissingDates(filters),
    ]);

    if (actualRows.length === 0 && forecastRows.length === 0) {
      return this.powerConsumptionQueryService.toPowerIntervalSummaryView({
        filters,
        actualRows,
        forecastRows,
        forecastMissingDates: [],
        actualMissingDatesForLookback: [],
      });
    }

    const actualMissingDates = new Set<string>();
    for (const missingDate of forecastMissingDatesResult.missingDates) {
      const lookback = getLookbackRange(missingDate);
      const result = await this.powerConsumptionService.checkActualMissingDates({
        companyName: filters.companyName,
        startDate: lookback.startDate,
        endDate: lookback.endDate,
      });
      for (const date of result.missingDates) {
        actualMissingDates.add(date);
      }
    }

    return this.powerConsumptionQueryService.toPowerIntervalSummaryView({
      filters,
      actualRows,
      forecastRows,
      forecastMissingDates: forecastMissingDatesResult.missingDates,
      actualMissingDatesForLookback: Array.from(actualMissingDates).sort(),
    });
  }
}

function getLookbackRange(targetDate: string): { startDate: string; endDate: string } {
  const base = new Date(`${targetDate}T00:00:00.000Z`);
  const start = new Date(base);
  start.setUTCDate(start.getUTCDate() - 14);
  const end = new Date(base);
  end.setUTCDate(end.getUTCDate() - 1);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
