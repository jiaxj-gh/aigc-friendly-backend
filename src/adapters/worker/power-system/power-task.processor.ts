import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { PowerTaskHandler } from './power-task.handler';
import {
  POWER_QUEUE_NAME,
  POWER_RUN_TASK_JOB_NAME,
  type PowerRunTaskJob,
} from './power-task.mapper';

@Injectable()
@Processor(POWER_QUEUE_NAME)
export class PowerTaskProcessor extends WorkerHost {
  constructor(private readonly handler: PowerTaskHandler) {
    super();
  }

  async process(job: PowerRunTaskJob) {
    if (job.name === POWER_RUN_TASK_JOB_NAME) {
      return await this.handler.processRunTask({ job });
    }

    throw new Error('Unsupported power task job');
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: PowerRunTaskJob): Promise<void> {
    await this.handler.onCompleted({ job });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: PowerRunTaskJob | undefined, error: Error): Promise<void> {
    await this.handler.onFailed({ job, error });
  }
}
