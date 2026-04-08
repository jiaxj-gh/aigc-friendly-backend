import { DomainError, INPUT_NORMALIZE_ERROR } from '@core/common/errors/domain-error';
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from '@core/common/input-normalize/input-normalize.policy';

export interface NormalizeCreatePartyAInput {
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

export interface CreatePowerSupplyNormalizedInput {
  readonly powerSupplyAddress: string;
  readonly powerSupplyNumber: string;
}

export interface CreatePartyANormalizedInput {
  readonly companyName: string;
  readonly creditCode: string | null;
  readonly companyAddress: string | null;
  readonly legalPerson: string | null;
  readonly depositoryBank: string | null;
  readonly bankAccountNo: string | null;
  readonly contactEmail: string | null;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly powerSupplyInfo: ReadonlyArray<CreatePowerSupplyNormalizedInput>;
}

export function normalizeCreatePartyAInput(
  input: NormalizeCreatePartyAInput,
): CreatePartyANormalizedInput {
  return {
    companyName: normalizeRequiredText(input.companyName, { fieldName: '公司名称' }),
    creditCode: normalizeNullableText(input.creditCode, '统一社会信用代码'),
    companyAddress: normalizeNullableText(input.companyAddress, '公司地址'),
    legalPerson: normalizeNullableText(input.legalPerson, '法人代表'),
    depositoryBank: normalizeNullableText(input.depositoryBank, '开户银行'),
    bankAccountNo: normalizeNullableText(input.bankAccountNo, '银行账号'),
    contactEmail: normalizeNullableText(input.contactEmail, '联系邮箱'),
    contactPerson: normalizeNullableText(input.contactPerson, '联系人'),
    contactPhone: normalizeNullableText(input.contactPhone, '联系电话'),
    powerSupplyInfo: normalizeCreatePowerSupplyInputList(input.powerSupplyInfo),
  };
}

function normalizeNullableText(input: unknown, fieldName: string): string | null {
  return normalizeOptionalText(input, 'to_null', { fieldName }) ?? null;
}

function normalizeCreatePowerSupplyInputList(
  input: unknown,
): ReadonlyArray<CreatePowerSupplyNormalizedInput> {
  if (input === undefined || input === null) {
    return [];
  }

  if (!Array.isArray(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST, '供电信息 必须是对象列表');
  }

  return input.map((item, index) => normalizeCreatePowerSupplyInputItem(item, index));
}

function normalizeCreatePowerSupplyInputItem(
  input: unknown,
  index: number,
): CreatePowerSupplyNormalizedInput {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM,
      `供电信息 第 ${index + 1} 项格式非法`,
    );
  }

  const record = input as Record<string, unknown>;
  return {
    powerSupplyAddress: normalizeRequiredText(record.powerSupplyAddress, {
      fieldName: `供电信息第 ${index + 1} 项的供电地址`,
    }),
    powerSupplyNumber: normalizeRequiredText(record.powerSupplyNumber, {
      fieldName: `供电信息第 ${index + 1} 项的供电户号`,
    }),
  };
}
