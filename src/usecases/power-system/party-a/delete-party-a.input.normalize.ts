import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface NormalizeDeletePartyAInput {
  readonly partyAId?: unknown;
}

export interface DeletePartyANormalizedInput {
  readonly partyAId: number;
}

export function normalizeDeletePartyAInput(
  input: NormalizeDeletePartyAInput,
): DeletePartyANormalizedInput {
  if (
    typeof input.partyAId !== 'number' ||
    !Number.isInteger(input.partyAId) ||
    input.partyAId < 1
  ) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      '甲方主体 ID 必须是大于 0 的整数',
    );
  }

  return {
    partyAId: input.partyAId,
  };
}
