import { Injectable } from '@nestjs/common';
import { PowerConsumptionQueueService } from '@modules/power-system/power-consumption/power-consumption.queue.service';
import { PowerConsumptionService } from '@modules/power-system/power-consumption/power-consumption.service';

export interface QueuePowerTaskUsecaseParams {
  readonly taskId: number;
}

@Injectable()
export class QueuePowerTaskUsecase {
  constructor(
    private readonly powerConsumptionQueueService: PowerConsumptionQueueService,
    private readonly powerConsumptionService: PowerConsumptionService,
  ) {}

  async execute(params: QueuePowerTaskUsecaseParams): Promise<void> {
    try {
      await this.powerConsumptionQueueService.enqueueRunTask({
        taskId: params.taskId,
      });
    } catch (error) {
      await this.powerConsumptionService.finalizeTaskPipelineWithFatalError({
        taskId: params.taskId,
        message: error instanceof Error ? error.message : '任务入队失败',
        occurredAt: new Date(),
      });
      throw error;
    }
  }
}
