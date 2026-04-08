import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface ExecutePriceAnalysisUploadedFile {
  readonly name: string;
  readonly content: string;
}

export interface NormalizeExecutePriceAnalysisInput {
  readonly files?: unknown;
}

export interface ExecutePriceAnalysisNormalizedInput {
  readonly files: readonly ExecutePriceAnalysisUploadedFile[];
}

export function normalizeExecutePriceAnalysisInput(
  input: NormalizeExecutePriceAnalysisInput,
): ExecutePriceAnalysisNormalizedInput {
  if (!Array.isArray(input.files) || input.files.length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.EMPTY_LIST_REJECTED, 'No files provided.');
  }

  return {
    files: input.files.map((file) => normalizeUploadedFile(file)),
  };
}

function normalizeUploadedFile(input: unknown): ExecutePriceAnalysisUploadedFile {
  if (typeof input !== 'object' || input === null) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM, 'Invalid file payload.');
  }

  const candidate = input as {
    readonly name?: unknown;
    readonly content?: unknown;
  };

  if (typeof candidate.name !== 'string' || candidate.name.trim().length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM, 'Invalid file name.');
  }

  if (typeof candidate.content !== 'string' || candidate.content.trim().length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM, 'Invalid file content.');
  }

  return {
    name: candidate.name.trim(),
    content: candidate.content.trim(),
  };
}
