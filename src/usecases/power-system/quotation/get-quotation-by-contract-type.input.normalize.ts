import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface NormalizeGetQuotationByContractTypeInput {
  readonly contractId?: unknown;
  readonly quoteTypeId?: unknown;
}

export interface GetQuotationByContractTypeNormalizedInput {
  readonly contractId: number;
  readonly quoteTypeId: 1 | 2 | 3;
}

export function normalizeGetQuotationByContractTypeInput(
  input: NormalizeGetQuotationByContractTypeInput,
): GetQuotationByContractTypeNormalizedInput {
  if (
    typeof input.contractId !== 'number' ||
    !Number.isInteger(input.contractId) ||
    input.contractId < 1
  ) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, '合同 ID 必须是大于 0 的整数');
  }

  if (
    typeof input.quoteTypeId !== 'number' ||
    !Number.isInteger(input.quoteTypeId) ||
    ![1, 2, 3].includes(input.quoteTypeId)
  ) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_ENUM_VALUE,
      '报价类型 ID 必须为 1、2、3 之一',
    );
  }

  return {
    contractId: input.contractId,
    quoteTypeId: input.quoteTypeId as 1 | 2 | 3,
  };
}
