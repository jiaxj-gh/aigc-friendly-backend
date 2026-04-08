import type {
  PowerRunTaskPayload,
  PowerRunTaskResult,
} from '@src/infrastructure/bullmq/contracts/power.contract';
import type { ConsumePowerTaskJobUsecaseInput } from '@src/usecases/power-system-worker/consume-power-task-job.usecase';
import type { Job } from 'bullmq';

export const POWER_QUEUE_NAME = 'power';
export const POWER_RUN_TASK_JOB_NAME = 'run-task';

export type PowerRunTaskJob = Job<
  PowerRunTaskPayload,
  PowerRunTaskResult,
  typeof POWER_RUN_TASK_JOB_NAME
>;

export function mapPowerRunTaskJobToProcessInput(input: {
  readonly job: PowerRunTaskJob;
}): ConsumePowerTaskJobUsecaseInput {
  return {
    taskId: input.job.data.taskId,
  };
}
