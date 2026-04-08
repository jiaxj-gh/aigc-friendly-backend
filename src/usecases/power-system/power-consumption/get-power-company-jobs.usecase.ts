import { Injectable } from '@nestjs/common';
import { PowerConsumptionQueryService } from '@modules/power-system/power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';
import type { PowerCompanyJobsView } from '@modules/power-system/power-consumption/power-consumption.types';
import { normalizeGetPowerCompanyJobsInput } from './get-power-company-jobs.input.normalize';

export interface GetPowerCompanyJobsUsecaseParams {
  readonly companyName: string;
}

export type GetPowerCompanyJobsUsecaseResult = PowerCompanyJobsView;

@Injectable()
export class GetPowerCompanyJobsUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerConsumptionQueryService: PowerConsumptionQueryService,
  ) {}

  async execute(
    params: GetPowerCompanyJobsUsecaseParams,
  ): Promise<GetPowerCompanyJobsUsecaseResult> {
    const filters = normalizeGetPowerCompanyJobsInput(params);
    const jobs = await this.powerConsumptionService.listCompanyJobs(filters);

    return this.powerConsumptionQueryService.toPowerCompanyJobsView({
      filters,
      jobs,
    });
  }
}
