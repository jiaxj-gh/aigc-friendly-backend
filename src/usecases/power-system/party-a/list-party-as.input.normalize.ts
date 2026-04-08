import { normalizeOptionalText } from '@core/common/input-normalize/input-normalize.policy';
import type { PartyAListFilters } from '@modules/power-system/party-a/party-a.types';

export interface NormalizeListPartyAsInput {
  readonly companyName?: unknown;
  readonly creditCode?: unknown;
}

export function normalizeListPartyAsInput(input: NormalizeListPartyAsInput): PartyAListFilters {
  const companyName = normalizeOptionalText(input.companyName, 'to_undefined', {
    fieldName: '公司名称',
  });
  const creditCode = normalizeOptionalText(input.creditCode, 'to_undefined', {
    fieldName: '统一社会信用代码',
  });

  return {
    companyName: typeof companyName === 'string' ? companyName : undefined,
    creditCode: typeof creditCode === 'string' ? creditCode : undefined,
  };
}
