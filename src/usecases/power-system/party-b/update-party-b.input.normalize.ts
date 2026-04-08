import { normalizeOptionalText } from '@core/common/input-normalize/input-normalize.policy';
import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';

export interface NormalizeUpdatePartyBInput {
  readonly partyBId?: unknown;
  readonly configName?: unknown;
  readonly companyName?: unknown;
  readonly creditCode?: unknown;
  readonly companyAddress?: unknown;
  readonly legalPerson?: unknown;
  readonly contactPerson?: unknown;
  readonly contactPhone?: unknown;
  readonly contactEmail?: unknown;
  readonly depositoryBank?: unknown;
  readonly bankAccountNo?: unknown;
  readonly hotLine?: unknown;
  readonly isDefault?: boolean;
}

export interface UpdatePartyBNormalizedInput {
  readonly partyBId: number;
  readonly configName?: string;
  readonly companyName?: string;
  readonly creditCode?: string;
  readonly companyAddress?: string;
  readonly legalPerson?: string;
  readonly contactPerson?: string;
  readonly contactPhone?: string;
  readonly contactEmail?: string;
  readonly depositoryBank?: string;
  readonly bankAccountNo?: string;
  readonly hotLine?: string;
  readonly isDefault?: boolean;
}

export function normalizeUpdatePartyBInput(
  input: NormalizeUpdatePartyBInput,
): UpdatePartyBNormalizedInput {
  if (
    typeof input.partyBId !== 'number' ||
    !Number.isInteger(input.partyBId) ||
    input.partyBId < 1
  ) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      '乙方主体 ID 必须是大于 0 的整数',
    );
  }

  return {
    partyBId: input.partyBId,
    ...pickOptionalText('configName', input.configName, '配置名称'),
    ...pickOptionalText('companyName', input.companyName, '公司名称'),
    ...pickOptionalText('creditCode', input.creditCode, '统一社会信用代码'),
    ...pickOptionalText('companyAddress', input.companyAddress, '公司地址'),
    ...pickOptionalText('legalPerson', input.legalPerson, '法人代表'),
    ...pickOptionalText('contactPerson', input.contactPerson, '联系人'),
    ...pickOptionalText('contactPhone', input.contactPhone, '联系电话'),
    ...pickOptionalText('contactEmail', input.contactEmail, '联系邮箱'),
    ...pickOptionalText('depositoryBank', input.depositoryBank, '开户银行'),
    ...pickOptionalText('bankAccountNo', input.bankAccountNo, '银行账号'),
    ...pickOptionalText('hotLine', input.hotLine, '服务热线'),
    ...(typeof input.isDefault === 'undefined' ? {} : { isDefault: input.isDefault }),
  };
}

function normalizeOptionalUpdateText(input: unknown, fieldName: string): string | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }
  const normalized = normalizeOptionalText(input, 'reject', { fieldName });
  return typeof normalized === 'string' ? normalized : undefined;
}

function pickOptionalText<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, string>> {
  const normalized = normalizeOptionalUpdateText(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, string>>;
}
