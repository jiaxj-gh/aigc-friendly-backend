import { Injectable } from '@nestjs/common';
import { PowerConsumptionQueryService } from '@modules/power-system/power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';
import type { PowerDailySummaryView } from '@modules/power-system/power-consumption/power-consumption.types';
import { normalizeGetPowerDailySummaryInput } from './get-power-daily-summary.input.normalize';

export interface GetPowerDailySummaryUsecaseParams {
  readonly companyName: string;
  readonly startDate: string;
  readonly endDate: string;
}

export type GetPowerDailySummaryUsecaseResult = PowerDailySummaryView;

@Injectable()
export class GetPowerDailySummaryUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerConsumptionQueryService: PowerConsumptionQueryService,
  ) {}

  async execute(
    params: GetPowerDailySummaryUsecaseParams,
  ): Promise<GetPowerDailySummaryUsecaseResult> {
    const filters = normalizeGetPowerDailySummaryInput(params);
    const [actualRows, forecastRows] = await Promise.all([
      this.powerConsumptionService.listActualDailyTotals(filters),
      this.powerConsumptionService.listForecastDailyTotals(filters),
    ]);

    return this.powerConsumptionQueryService.toPowerDailySummaryView({
      filters,
      actualRows,
      forecastRows,
    });
  }
}
