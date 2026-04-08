import type { PowerIntervalSummaryFilters } from '@modules/power-system/power-consumption/power-consumption.types';
import { normalizeGetPowerDailySummaryInput } from './get-power-daily-summary.input.normalize';

export interface NormalizeGetPowerIntervalSummaryInput {
  readonly companyName?: unknown;
  readonly startDate?: unknown;
  readonly endDate?: unknown;
}

export function normalizeGetPowerIntervalSummaryInput(
  input: NormalizeGetPowerIntervalSummaryInput,
): PowerIntervalSummaryFilters {
  return normalizeGetPowerDailySummaryInput(input);
}
