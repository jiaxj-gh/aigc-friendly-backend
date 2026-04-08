import type {
  PowerRunTaskPayload,
  PowerRunTaskResult,
} from '@src/infrastructure/bullmq/contracts/power.contract';
import type {
  ConsumePowerTaskJobCompleteInput,
  ConsumePowerTaskJobFailInput,
  ConsumePowerTaskJobUsecaseInput,
} from '@src/usecases/power-system-worker/consume-power-task-job.usecase';
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
  const jobId = resolveJobId({ job: input.job });
  const traceId = resolveTraceId({
    job: input.job,
    mode: 'strict',
  });
  return {
    queueName: POWER_QUEUE_NAME,
    jobName: POWER_RUN_TASK_JOB_NAME,
    jobId,
    traceId,
    taskId: input.job.data.taskId,
    attemptsMade: input.job.attemptsMade,
    maxAttempts: resolveMaxAttempts({ job: input.job }),
    enqueuedAt: resolveDate({ timestamp: input.job.timestamp }),
    startedAt: resolveDate({ timestamp: input.job.processedOn }),
  };
}

export function mapPowerRunTaskJobToCompleteInput(input: {
  readonly job: PowerRunTaskJob;
}): ConsumePowerTaskJobCompleteInput {
  const jobId = resolveJobId({ job: input.job });
  const traceId = resolveTraceId({
    job: input.job,
    mode: 'strict',
  });
  return {
    queueName: POWER_QUEUE_NAME,
    jobName: POWER_RUN_TASK_JOB_NAME,
    jobId,
    traceId,
    taskId: input.job.data.taskId,
    attemptsMade: input.job.attemptsMade,
    maxAttempts: resolveMaxAttempts({ job: input.job }),
    enqueuedAt: resolveDate({ timestamp: input.job.timestamp }),
    startedAt: resolveDate({ timestamp: input.job.processedOn }),
    finishedAt: resolveDate({ timestamp: input.job.finishedOn }),
  };
}

export function mapPowerRunTaskJobToFailInput(input: {
  readonly job: PowerRunTaskJob;
  readonly error: Error;
}): ConsumePowerTaskJobFailInput {
  const occurredAt = resolveDate({ timestamp: input.job.finishedOn });
  const jobId = resolveJobId({ job: input.job });
  const traceId = resolveTraceId({
    job: input.job,
    mode: 'degraded',
  });
  return {
    queueName: POWER_QUEUE_NAME,
    jobName: POWER_RUN_TASK_JOB_NAME,
    jobId,
    traceId,
    taskId: input.job.data.taskId,
    attemptsMade: input.job.attemptsMade,
    maxAttempts: resolveMaxAttempts({ job: input.job }),
    enqueuedAt: resolveDate({ timestamp: input.job.timestamp }),
    startedAt: resolveDate({ timestamp: input.job.processedOn }),
    finishedAt: occurredAt,
    occurredAt,
    reason: input.error.message.slice(0, 128),
  };
}

export function mapMissingPowerRunTaskJobToFailInput(input: {
  readonly error: Error;
  readonly occurredAt?: Date;
}): ConsumePowerTaskJobFailInput {
  const occurredAt = input.occurredAt ?? new Date();
  const jobId = resolveMissingJobId({
    occurredAt,
    jobName: POWER_RUN_TASK_JOB_NAME,
  });
  return {
    queueName: POWER_QUEUE_NAME,
    jobName: POWER_RUN_TASK_JOB_NAME,
    jobId,
    traceId: jobId,
    attemptsMade: 0,
    enqueuedAt: occurredAt,
    finishedAt: occurredAt,
    occurredAt,
    reason: `worker_event_job_missing:${input.error.message.slice(0, 96)}`,
  };
}

function resolveDate(input: { readonly timestamp?: number }): Date | undefined {
  if (typeof input.timestamp !== 'number' || Number.isNaN(input.timestamp)) {
    return undefined;
  }
  return new Date(input.timestamp);
}

function resolveMaxAttempts(input: { readonly job: PowerRunTaskJob }): number | undefined {
  const attempts = input.job.opts.attempts;
  if (typeof attempts !== 'number' || Number.isNaN(attempts)) {
    return undefined;
  }
  return attempts;
}

function resolveJobId(input: { readonly job: PowerRunTaskJob }): string {
  if (typeof input.job.id === 'number') {
    return String(input.job.id);
  }
  return input.job.id ?? `${POWER_RUN_TASK_JOB_NAME}:${input.job.timestamp}`;
}

function resolveTraceId(input: {
  readonly job: PowerRunTaskJob;
  readonly mode: 'strict' | 'degraded';
}): string {
  const payloadTraceId = input.job.data.traceId?.trim();
  if (payloadTraceId) {
    return payloadTraceId;
  }
  if (input.mode === 'strict') {
    throw new Error(`missing_payload_trace_id:${input.job.name}`);
  }
  const jobId = resolveJobId({ job: input.job });
  return `degraded-trace:${input.job.name}:${jobId}`;
}

function resolveMissingJobId(input: {
  readonly occurredAt: Date;
  readonly jobName: string;
}): string {
  return `missing-job:${input.jobName}:${input.occurredAt.getTime()}`;
}
