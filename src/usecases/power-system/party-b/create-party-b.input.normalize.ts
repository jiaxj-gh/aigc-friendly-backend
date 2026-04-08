import { normalizeRequiredText } from '@core/common/input-normalize/input-normalize.policy';

export interface NormalizeCreatePartyBInput {
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

export interface CreatePartyBNormalizedInput {
  readonly configName: string;
  readonly companyName: string;
  readonly creditCode: string;
  readonly companyAddress: string;
  readonly legalPerson: string;
  readonly contactPerson: string;
  readonly contactPhone: string;
  readonly contactEmail: string;
  readonly depositoryBank: string;
  readonly bankAccountNo: string;
  readonly hotLine: string;
  readonly isDefault: boolean;
}

export function normalizeCreatePartyBInput(
  input: NormalizeCreatePartyBInput,
): CreatePartyBNormalizedInput {
  return {
    configName: normalizeRequiredText(input.configName, { fieldName: '配置名称' }),
    companyName: normalizeRequiredText(input.companyName, { fieldName: '公司名称' }),
    creditCode: normalizeRequiredText(input.creditCode, { fieldName: '统一社会信用代码' }),
    companyAddress: normalizeRequiredText(input.companyAddress, { fieldName: '公司地址' }),
    legalPerson: normalizeRequiredText(input.legalPerson, { fieldName: '法人代表' }),
    contactPerson: normalizeRequiredText(input.contactPerson, { fieldName: '联系人' }),
    contactPhone: normalizeRequiredText(input.contactPhone, { fieldName: '联系电话' }),
    contactEmail: normalizeRequiredText(input.contactEmail, { fieldName: '联系邮箱' }),
    depositoryBank: normalizeRequiredText(input.depositoryBank, { fieldName: '开户银行' }),
    bankAccountNo: normalizeRequiredText(input.bankAccountNo, { fieldName: '银行账号' }),
    hotLine: normalizeRequiredText(input.hotLine, { fieldName: '服务热线' }),
    isDefault: input.isDefault === true,
  };
}
