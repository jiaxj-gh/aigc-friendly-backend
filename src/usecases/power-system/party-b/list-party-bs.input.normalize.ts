import { normalizeOptionalText } from '@core/common/input-normalize/input-normalize.policy';
import type { PartyBListFilters } from '@modules/power-system/party-b/party-b.types';

export interface NormalizeListPartyBsInput {
  readonly configName?: unknown;
  readonly companyName?: unknown;
  readonly isDefault?: boolean;
}

export function normalizeListPartyBsInput(input: NormalizeListPartyBsInput): PartyBListFilters {
  const configName = normalizeOptionalText(input.configName, 'to_undefined', {
    fieldName: '配置名称',
  });
  const companyName = normalizeOptionalText(input.companyName, 'to_undefined', {
    fieldName: '公司名称',
  });

  return {
    configName: typeof configName === 'string' ? configName : undefined,
    companyName: typeof companyName === 'string' ? companyName : undefined,
    isDefault: input.isDefault,
  };
}
