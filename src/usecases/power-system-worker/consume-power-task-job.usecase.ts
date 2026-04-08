import { Injectable } from '@nestjs/common';
import { resolveAsyncTaskBizKey } from '@src/core/common/async-task/async-task-identifier.policy';
import { AsyncTaskRecordService } from '@src/modules/async-task-record/async-task-record.service';
import type { AsyncTaskRecordSource } from '@src/modules/async-task-record/async-task-record.types';
import { PowerTaskPipelineService } from '@modules/power-system/power-consumption-worker/power-task-pipeline.service';

export interface ConsumePowerTaskJobUsecaseInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly taskId: number;
  readonly attemptsMade: number;
  readonly maxAttempts?: number;
  readonly enqueuedAt?: Date;
  readonly startedAt?: Date;
}

export interface ConsumePowerTaskJobCompleteInput {
  readonly queueName: string;
  readonly jobName: string;
  readonly jobId: string;
  readonly traceId: string;
  readonly taskId?: number;
  readonly attemptsMade: number;
  readonly maxAttempts?: number;
  readonly enqueuedAt?: Date;
  readonly startedAt?: Date;
  readonly finishedAt?: Date;
}

export interface ConsumePowerTaskJobFailInput extends ConsumePowerTaskJobCompleteInput {
  readonly occurredAt?: Date;
  readonly reason?: string;
}

export interface ConsumePowerTaskJobUsecaseResult {
  readonly accepted: boolean;
  readonly taskId: number;
}

@Injectable()
export class ConsumePowerTaskJobUsecase {
  constructor(
    private readonly powerTaskPipelineService: PowerTaskPipelineService,
    private readonly asyncTaskRecordService: AsyncTaskRecordService,
  ) {}

  async process(input: ConsumePowerTaskJobUsecaseInput): Promise<ConsumePowerTaskJobUsecaseResult> {
    await this.asyncTaskRecordService.recordStarted({
      data: {
        queueName: input.queueName,
        jobName: input.jobName,
        jobId: input.jobId,
        traceId: input.traceId,
        bizType: 'power_task',
        bizKey: resolveAsyncTaskBizKey({
          domain: 'power_task',
          traceId: input.traceId,
          jobId: input.jobId,
        }),
        bizSubKey: String(input.taskId),
        source: this.resolveSource(),
        reason: 'worker_processing',
        attemptCount: this.resolveProcessingAttemptCount({ attemptsMade: input.attemptsMade }),
        maxAttempts: input.maxAttempts,
        enqueuedAt: input.enqueuedAt,
        startedAt: input.startedAt,
        occurredAt: input.startedAt,
      },
    });

    await this.powerTaskPipelineService.run({
      taskId: input.taskId,
    });

    return {
      accepted: true,
      taskId: input.taskId,
    };
  }

  async complete(input: ConsumePowerTaskJobCompleteInput): Promise<void> {
    await this.asyncTaskRecordService.recordFinished({
      data: {
        queueName: input.queueName,
        jobName: input.jobName,
        jobId: input.jobId,
        traceId: input.traceId,
        bizType: 'power_task',
        bizKey: resolveAsyncTaskBizKey({
          domain: 'power_task',
          traceId: input.traceId,
          jobId: input.jobId,
        }),
        bizSubKey: this.resolveBizSubKey({ taskId: input.taskId }),
        source: this.resolveSource(),
        status: 'succeeded',
        reason: 'worker_completed',
        attemptCount: this.resolveFinalAttemptCount({ attemptsMade: input.attemptsMade }),
        maxAttempts: input.maxAttempts,
        enqueuedAt: input.enqueuedAt,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        occurredAt: input.finishedAt,
      },
    });
  }

  async fail(input: ConsumePowerTaskJobFailInput): Promise<void> {
    await this.asyncTaskRecordService.recordFinished({
      data: {
        queueName: input.queueName,
        jobName: input.jobName,
        jobId: input.jobId,
        traceId: input.traceId,
        bizType: 'power_task',
        bizKey: resolveAsyncTaskBizKey({
          domain: 'power_task',
          traceId: input.traceId,
          jobId: input.jobId,
        }),
        bizSubKey: this.resolveBizSubKey({ taskId: input.taskId }),
        source: this.resolveSource(),
        status: 'failed',
        reason: input.reason,
        attemptCount: this.resolveFinalAttemptCount({ attemptsMade: input.attemptsMade }),
        maxAttempts: input.maxAttempts,
        enqueuedAt: input.enqueuedAt,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        occurredAt: input.occurredAt ?? input.finishedAt,
      },
    });
  }

  private resolveProcessingAttemptCount(input: { readonly attemptsMade: number }): number {
    return Math.max(input.attemptsMade + 1, 1);
  }

  private resolveFinalAttemptCount(input: { readonly attemptsMade: number }): number {
    return Math.max(input.attemptsMade, 1);
  }

  private resolveSource(): AsyncTaskRecordSource {
    return 'system';
  }

  private resolveBizSubKey(input: { readonly taskId?: number }): string | undefined {
    if (typeof input.taskId !== 'number' || input.taskId <= 0) {
      return undefined;
    }
    return String(input.taskId);
  }
}
