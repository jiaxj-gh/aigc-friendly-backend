import { Injectable } from '@nestjs/common';
import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { PowerConsumptionQueryService } from '@modules/power-system/power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';
import type { PowerTaskStatusView } from '@modules/power-system/power-consumption/power-consumption.types';
import { normalizeGetPowerTaskStatusInput } from './get-power-task-status.input.normalize';

export interface GetPowerTaskStatusUsecaseParams {
  readonly taskId: number;
}

export type GetPowerTaskStatusUsecaseResult = PowerTaskStatusView;

@Injectable()
export class GetPowerTaskStatusUsecase {
  constructor(
    private readonly powerConsumptionService: PowerConsumptionService,
    private readonly powerConsumptionQueryService: PowerConsumptionQueryService,
  ) {}

  async execute(params: GetPowerTaskStatusUsecaseParams): Promise<GetPowerTaskStatusUsecaseResult> {
    const filters = normalizeGetPowerTaskStatusInput(params);
    const task = await this.powerConsumptionService.findTaskSummaryById(filters.taskId);
    if (!task) {
      throw new DomainError(POWER_SYSTEM_ERROR.TASK_NOT_FOUND, '任务不存在');
    }

    return this.powerConsumptionQueryService.toPowerTaskStatusView(task);
  }
}
