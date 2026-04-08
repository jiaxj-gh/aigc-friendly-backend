import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';
import type { ContractListFilters } from '@modules/power-system/contract/contract.types';

export interface NormalizeListContractsInput {
  readonly partyAId?: unknown;
  readonly page?: unknown;
  readonly pageSize?: unknown;
}

export function normalizeListContractsInput(
  input: NormalizeListContractsInput = {},
): ContractListFilters {
  validatePositiveInt(input.page, '页码');
  validatePageSize(input.pageSize);
  validateInteger(input.partyAId, '甲方 ID');

  return {
    partyAId: typeof input.partyAId === 'number' ? input.partyAId : undefined,
    page: typeof input.page === 'number' ? input.page : 1,
    pageSize: typeof input.pageSize === 'number' ? input.pageSize : 20,
  };
}

function validatePositiveInt(value: unknown, fieldName: string): void {
  if (typeof value === 'undefined') {
    return;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      `${fieldName} 必须是大于 0 的整数`,
    );
  }
}

function validatePageSize(value: unknown): void {
  if (typeof value === 'undefined') {
    return;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 100) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      '每页数量 必须是 1 到 100 之间的整数',
    );
  }
}

function validateInteger(value: unknown, fieldName: string): void {
  if (typeof value === 'undefined') {
    return;
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, `${fieldName} 必须是整数`);
  }
}
