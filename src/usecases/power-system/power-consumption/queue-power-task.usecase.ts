import { Injectable } from '@nestjs/common';
import {
  resolveAsyncTaskBizKey,
  resolveEnqueueFailureIdentifiers,
} from '@src/core/common/async-task/async-task-identifier.policy';
import { AsyncTaskRecordService } from '@src/modules/async-task-record/async-task-record.service';
import type { AsyncTaskRecordSource } from '@src/modules/async-task-record/async-task-record.types';
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
    private readonly asyncTaskRecordService: AsyncTaskRecordService,
  ) {}

  async execute(params: QueuePowerTaskUsecaseParams): Promise<void> {
    const occurredAt = new Date();
    const stableTaskKey = `power-task-${String(params.taskId)}`;
    try {
      const result = await this.powerConsumptionQueueService.enqueueRunTask({
        taskId: params.taskId,
      });
      await this.asyncTaskRecordService.recordEnqueued({
        data: {
          queueName: 'power',
          jobName: 'run-task',
          jobId: result.jobId,
          traceId: result.traceId,
          bizType: 'power_task',
          bizKey: resolveAsyncTaskBizKey({
            domain: 'power_task',
            traceId: result.traceId,
            jobId: result.jobId,
            dedupKey: result.jobId,
          }),
          bizSubKey: String(params.taskId),
          source: this.resolveSource(),
          reason: 'enqueue_accepted',
          occurredAt,
          dedupKey: result.jobId,
          maxAttempts: 3,
          enqueuedAt: occurredAt,
        },
      });
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('power_task_enqueue_failed');
      const identifiers = resolveEnqueueFailureIdentifiers({
        domain: 'power_task',
        traceId: stableTaskKey,
        dedupKey: stableTaskKey,
        occurredAt,
        traceIdPrefix: 'power-task-enqueue:',
      });
      await this.asyncTaskRecordService.recordEnqueueFailed({
        data: {
          queueName: 'power',
          jobName: 'run-task',
          jobId: identifiers.failedJobId,
          traceId: identifiers.traceId,
          bizType: 'power_task',
          bizKey: identifiers.bizKey,
          bizSubKey: String(params.taskId),
          source: this.resolveSource(),
          reason: normalizedError.message.slice(0, 128),
          occurredAt,
          dedupKey: stableTaskKey,
          maxAttempts: 3,
        },
      });
      await this.powerConsumptionService.finalizeTaskPipelineWithFatalError({
        taskId: params.taskId,
        message: normalizedError.message,
        occurredAt,
      });
      throw normalizedError;
    }
  }

  private resolveSource(): AsyncTaskRecordSource {
    return 'user_action';
  }
}
