export const POWER_TASK_STATUSES = [
  'created',
  'uploading',
  'uploaded',
  'computing',
  'completed',
] as const;

export type PowerTaskStatus = (typeof POWER_TASK_STATUSES)[number];

export const POWER_COMPUTE_JOB_STATUSES = ['not_started', 'success', 'failed'] as const;

export type PowerComputeJobStatus = (typeof POWER_COMPUTE_JOB_STATUSES)[number];

export const POWER_UPLOAD_FILE_STATUSES = ['not_started', 'completed', 'failed'] as const;

export type PowerUploadFileStatus = (typeof POWER_UPLOAD_FILE_STATUSES)[number];
