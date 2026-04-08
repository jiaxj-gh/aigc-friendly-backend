import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';
import type { PowerTaskStatusFilters } from '@modules/power-system/power-consumption/power-consumption.types';

export interface NormalizeGetPowerTaskStatusInput {
  readonly taskId?: unknown;
}

export function normalizeGetPowerTaskStatusInput(
  input: NormalizeGetPowerTaskStatusInput,
): PowerTaskStatusFilters {
  if (typeof input.taskId !== 'number' || !Number.isInteger(input.taskId)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, '任务 ID 必须是整数');
  }

  if (input.taskId <= 0) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, '任务 ID 必须大于 0');
  }

  return {
    taskId: input.taskId,
  };
}
