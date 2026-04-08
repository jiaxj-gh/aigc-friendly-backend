import { Injectable } from '@nestjs/common';
import { BULLMQ_JOBS, BULLMQ_QUEUES } from '@src/infrastructure/bullmq/bullmq.constants';
import { BullMqProducerGateway } from '@src/infrastructure/bullmq/producer.gateway';
import { PinoLogger } from 'nestjs-pino';

export interface EnqueuePowerTaskInput {
  readonly taskId: number;
}

export interface EnqueuePowerTaskResult {
  readonly jobId: string;
  readonly traceId: string;
}

@Injectable()
export class PowerConsumptionQueueService {
  constructor(
    private readonly producer: BullMqProducerGateway,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PowerConsumptionQueueService.name);
  }

  async enqueueRunTask(input: EnqueuePowerTaskInput): Promise<EnqueuePowerTaskResult> {
    const stableTaskKey = `power-task-${String(input.taskId)}`;
    const job = await this.producer.enqueue({
      queueName: BULLMQ_QUEUES.POWER,
      jobName: BULLMQ_JOBS.POWER.RUN_TASK,
      payload: {
        taskId: input.taskId,
      },
      dedupKey: stableTaskKey,
      traceId: stableTaskKey,
    });

    this.logger.info(
      {
        taskId: input.taskId,
        jobId: job.jobId,
        traceId: job.traceId,
      },
      'Power task job accepted',
    );

    return {
      jobId: job.jobId,
      traceId: job.traceId,
    };
  }
}
