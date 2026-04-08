import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';
import type { PowerCompanyJobsFilters } from '@modules/power-system/power-consumption/power-consumption.types';

export interface NormalizeGetPowerCompanyJobsInput {
  readonly companyName?: unknown;
}

export function normalizeGetPowerCompanyJobsInput(
  input: NormalizeGetPowerCompanyJobsInput,
): PowerCompanyJobsFilters {
  if (typeof input.companyName !== 'string') {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT, '公司名称必须是字符串');
  }

  const companyName = input.companyName.trim();
  if (companyName.length === 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY, '公司名称不能为空');
  }

  return {
    companyName,
  };
}
