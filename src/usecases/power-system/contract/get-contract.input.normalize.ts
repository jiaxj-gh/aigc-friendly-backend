import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface NormalizeGetContractInput {
  readonly contractId?: unknown;
}

export interface GetContractNormalizedInput {
  readonly contractId: number;
}

export function normalizeGetContractInput(
  input: NormalizeGetContractInput,
): GetContractNormalizedInput {
  if (
    typeof input.contractId !== 'number' ||
    !Number.isInteger(input.contractId) ||
    input.contractId < 1
  ) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, '合同 ID 必须是大于 0 的整数');
  }

  return {
    contractId: input.contractId,
  };
}
