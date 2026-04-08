import { BULLMQ_JOBS, BULLMQ_QUEUES } from '../bullmq.constants';
import { isOptionalNonEmptyString, isRecord } from './shared-payload-validators';

export interface PowerRunTaskPayload {
  readonly taskId: number;
  readonly traceId?: string;
}

export interface PowerRunTaskResult {
  readonly accepted: boolean;
  readonly taskId: number;
}

const isPowerRunTaskPayload = (payload: unknown): payload is PowerRunTaskPayload => {
  if (!isRecord(payload)) {
    return false;
  }

  return (
    typeof payload.taskId === 'number' &&
    Number.isInteger(payload.taskId) &&
    payload.taskId > 0 &&
    isOptionalNonEmptyString(payload.traceId)
  );
};

export const POWER_JOB_CONTRACT = {
  [BULLMQ_JOBS.POWER.RUN_TASK]: {
    payload: {} as PowerRunTaskPayload,
    result: {} as PowerRunTaskResult,
    payloadValidator: isPowerRunTaskPayload,
  },
} as const;

export const POWER_QUEUE_CONTRACT = {
  queueName: BULLMQ_QUEUES.POWER,
  jobs: POWER_JOB_CONTRACT,
} as const;
