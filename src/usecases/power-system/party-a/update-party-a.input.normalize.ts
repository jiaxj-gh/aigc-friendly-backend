import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';
import { normalizeOptionalText } from '@core/common/input-normalize/input-normalize.policy';

export interface NormalizeUpdatePartyAInput {
  readonly partyAId?: unknown;
  readonly companyName?: unknown;
  readonly creditCode?: unknown;
  readonly companyAddress?: unknown;
  readonly legalPerson?: unknown;
  readonly depositoryBank?: unknown;
  readonly bankAccountNo?: unknown;
  readonly contactEmail?: unknown;
  readonly contactPerson?: unknown;
  readonly contactPhone?: unknown;
  readonly powerSupplyInfo?: unknown;
}

export interface UpdatePowerSupplyNormalizedInput {
  readonly powerSupplyAddress: string;
  readonly powerSupplyNumber: string;
}

export interface UpdatePartyANormalizedInput {
  readonly partyAId: number;
  readonly companyName?: string;
  readonly creditCode?: string | null;
  readonly companyAddress?: string | null;
  readonly legalPerson?: string | null;
  readonly depositoryBank?: string | null;
  readonly bankAccountNo?: string | null;
  readonly contactEmail?: string | null;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly powerSupplyInfo?: ReadonlyArray<UpdatePowerSupplyNormalizedInput>;
}

export function normalizeUpdatePartyAInput(
  input: NormalizeUpdatePartyAInput,
): UpdatePartyANormalizedInput {
  if (
    typeof input.partyAId !== 'number' ||
    !Number.isInteger(input.partyAId) ||
    input.partyAId < 1
  ) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      '甲方主体 ID 必须是大于 0 的整数',
    );
  }

  return {
    partyAId: input.partyAId,
    ...pickOptionalRequiredText('companyName', input.companyName, '公司名称'),
    ...pickOptionalNullableText('creditCode', input.creditCode, '统一社会信用代码'),
    ...pickOptionalNullableText('companyAddress', input.companyAddress, '公司地址'),
    ...pickOptionalNullableText('legalPerson', input.legalPerson, '法人代表'),
    ...pickOptionalNullableText('depositoryBank', input.depositoryBank, '开户银行'),
    ...pickOptionalNullableText('bankAccountNo', input.bankAccountNo, '银行账号'),
    ...pickOptionalNullableText('contactEmail', input.contactEmail, '联系邮箱'),
    ...pickOptionalNullableText('contactPerson', input.contactPerson, '联系人'),
    ...pickOptionalNullableText('contactPhone', input.contactPhone, '联系电话'),
    ...(typeof input.powerSupplyInfo === 'undefined' || input.powerSupplyInfo === null
      ? {}
      : { powerSupplyInfo: normalizeUpdatePowerSupplyInputList(input.powerSupplyInfo) }),
  };
}

function normalizeOptionalRequiredText(input: unknown, fieldName: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }
  const normalized = normalizeOptionalText(input, 'reject', { fieldName });
  if (typeof normalized !== 'string') {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT, `${fieldName} 必须是字符串`);
  }
  return normalized;
}

function normalizeOptionalNullableText(
  input: unknown,
  fieldName: string,
): string | null | undefined {
  if (input === undefined) {
    return undefined;
  }
  return normalizeOptionalText(input, 'reject', { fieldName });
}

function pickOptionalRequiredText<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, string>> {
  const normalized = normalizeOptionalRequiredText(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, string>>;
}

function pickOptionalNullableText<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, string | null>> {
  const normalized = normalizeOptionalNullableText(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, string | null>>;
}

function normalizeUpdatePowerSupplyInputList(
  input: unknown,
): ReadonlyArray<UpdatePowerSupplyNormalizedInput> {
  if (!Array.isArray(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST, '供电信息 必须是对象列表');
  }

  return input.map((item, index) => normalizeUpdatePowerSupplyInputItem(item, index));
}

function normalizeUpdatePowerSupplyInputItem(
  input: unknown,
  index: number,
): UpdatePowerSupplyNormalizedInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM,
      `供电信息 第 ${index + 1} 项格式非法`,
    );
  }

  const record = input as Record<string, unknown>;
  const powerSupplyAddress = normalizeOptionalText(record.powerSupplyAddress, 'reject', {
    fieldName: `供电信息第 ${index + 1} 项的供电地址`,
  });
  const powerSupplyNumber = normalizeOptionalText(record.powerSupplyNumber, 'reject', {
    fieldName: `供电信息第 ${index + 1} 项的供电户号`,
  });

  if (typeof powerSupplyAddress !== 'string') {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT,
      `供电信息第 ${index + 1} 项的供电地址 必须是字符串`,
    );
  }
  if (typeof powerSupplyNumber !== 'string') {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT,
      `供电信息第 ${index + 1} 项的供电户号 必须是字符串`,
    );
  }

  return {
    powerSupplyAddress,
    powerSupplyNumber,
  };
}
