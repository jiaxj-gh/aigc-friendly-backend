import { DomainError, INPUT_NORMALIZE_ERROR, TIME_ERROR } from '@core/common/errors/domain-error';
import { validateTimeRangeOrder } from '@core/common/time/time-guard.policy';
import { parseTimeInput } from '@core/common/time/time-parse.policy';
import type { PowerDailySummaryFilters } from '@modules/power-system/power-consumption/power-consumption.types';

export interface NormalizeGetPowerDailySummaryInput {
  readonly companyName?: unknown;
  readonly startDate?: unknown;
  readonly endDate?: unknown;
}

export function normalizeGetPowerDailySummaryInput(
  input: NormalizeGetPowerDailySummaryInput,
): PowerDailySummaryFilters {
  const companyName = normalizeRequiredText(input.companyName, '企业名称');
  const startDate = normalizeRequiredDate(input.startDate, '开始日期');
  const endDate = normalizeRequiredDate(input.endDate, '结束日期');

  const rangeError = validateTimeRangeOrder({
    start: new Date(`${startDate}T00:00:00.000Z`),
    end: new Date(`${endDate}T00:00:00.000Z`),
  });
  if (rangeError) {
    throw new DomainError(TIME_ERROR.INVALID_TIME_RANGE_ORDER, '起始日期不能晚于终止日期');
  }

  return {
    companyName,
    startDate,
    endDate,
  };
}

function normalizeRequiredText(input: unknown, fieldName: string): string {
  if (typeof input !== 'string') {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT, `${fieldName} 必须是字符串`);
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY, `${fieldName} 不能为空`);
  }

  return trimmed;
}

function normalizeRequiredDate(input: unknown, fieldName: string): string {
  const parsed = parseTimeInput(input);
  if (parsed instanceof DomainError || parsed.kind !== 'date') {
    throw new DomainError(TIME_ERROR.INVALID_TIME_INPUT, `${fieldName} 必须是 YYYY-MM-DD 日期`);
  }

  return `${parsed.parts.year.toString().padStart(4, '0')}-${parsed.parts.month
    .toString()
    .padStart(2, '0')}-${parsed.parts.day.toString().padStart(2, '0')}`;
}
