import { DomainError, INPUT_NORMALIZE_ERROR } from '@src/core/common/errors/domain-error';
import type { BillDocxPayload, BillQuotaItem } from '@modules/power-system/bill/bill.types';

export interface NormalizeGenerateBillDocxInput {
  readonly partyAName?: unknown;
  readonly quotaInfo?: unknown;
}

export type GenerateBillDocxNormalizedInput = BillDocxPayload;

export function normalizeGenerateBillDocxInput(
  input: NormalizeGenerateBillDocxInput,
): GenerateBillDocxNormalizedInput {
  if (typeof input.partyAName !== 'string') {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT,
      'partyAName 必须是字符串',
      input.partyAName,
    );
  }

  if (!Array.isArray(input.quotaInfo)) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST,
      'quotaInfo 必须是数组',
      input.quotaInfo,
    );
  }

  const quotaInfo = input.quotaInfo.map((item, index) => normalizeQuotaItem(item, index));

  return {
    partyAName: input.partyAName,
    quotaInfo,
  };
}

function normalizeQuotaItem(item: unknown, index: number): BillQuotaItem {
  if (!isRecord(item)) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM,
      `quotaInfo[${index}] 必须是对象`,
      item,
    );
  }

  return {
    quotaPrice: toOptionalString(item.quotaPrice),
    quotaType: toOptionalString(item.quotaType),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toOptionalString(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  return '';
}
