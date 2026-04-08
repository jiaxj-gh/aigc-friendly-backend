import { Injectable } from '@nestjs/common';
import { PowerConsumptionQueryService } from '@modules/power-system/power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';

export type ListPowerCompaniesUsecaseResult = readonly string[];

@Injectable()
export class ListPowerCompaniesUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerConsumptionQueryService: PowerConsumptionQueryService,
  ) {}

  async execute(): Promise<ListPowerCompaniesUsecaseResult> {
    const companyNames = await this.powerConsumptionService.listDistinctRetailUserNames();
    return this.powerConsumptionQueryService.toPowerCompaniesView(companyNames).items;
  }
}
