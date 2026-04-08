import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface NormalizeDeletePartyBInput {
  readonly partyBId?: unknown;
}

export interface DeletePartyBNormalizedInput {
  readonly partyBId: number;
}

export function normalizeDeletePartyBInput(
  input: NormalizeDeletePartyBInput,
): DeletePartyBNormalizedInput {
  if (
    typeof input.partyBId !== 'number' ||
    !Number.isInteger(input.partyBId) ||
    input.partyBId < 1
  ) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      '乙方主体 ID 必须是大于 0 的整数',
    );
  }

  return {
    partyBId: input.partyBId,
  };
}
