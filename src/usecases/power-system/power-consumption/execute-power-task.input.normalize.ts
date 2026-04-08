import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface ExecutePowerTaskUploadedFile {
  readonly originalName: string;
  readonly buffer: Buffer;
}

export interface NormalizeExecutePowerTaskInput {
  readonly taskName?: unknown;
  readonly files?: unknown;
}

export interface ExecutePowerTaskNormalizedInput {
  readonly taskName: string | null;
  readonly files: readonly ExecutePowerTaskUploadedFile[];
}

export function normalizeExecutePowerTaskInput(
  input: NormalizeExecutePowerTaskInput,
): ExecutePowerTaskNormalizedInput {
  const taskName = normalizeOptionalTaskName(input.taskName);
  const files = normalizeFiles(input.files);

  return {
    taskName,
    files,
  };
}

function normalizeOptionalTaskName(input: unknown): string | null {
  if (typeof input === 'undefined' || input === null) {
    return null;
  }

  if (typeof input !== 'string') {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT, '任务名称必须是字符串');
  }

  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeFiles(input: unknown): readonly ExecutePowerTaskUploadedFile[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.EMPTY_LIST_REJECTED, '至少上传一个CSV文件');
  }

  return input.map((item) => normalizeUploadedFile(item));
}

function normalizeUploadedFile(input: unknown): ExecutePowerTaskUploadedFile {
  if (typeof input !== 'object' || input === null) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM, '上传文件格式不正确');
  }

  const candidate = input as {
    readonly originalname?: unknown;
    readonly originalName?: unknown;
    readonly buffer?: unknown;
  };

  const originalName = candidate.originalname ?? candidate.originalName;
  if (typeof originalName !== 'string' || originalName.trim().length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM, '上传文件名无效');
  }

  if (!Buffer.isBuffer(candidate.buffer)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM, '上传文件内容无效');
  }

  return {
    originalName: originalName.trim(),
    buffer: candidate.buffer,
  };
}
