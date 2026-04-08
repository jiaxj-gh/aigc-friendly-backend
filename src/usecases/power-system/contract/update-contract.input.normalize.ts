import { DomainError, INPUT_NORMALIZE_ERROR, TIME_ERROR } from '@core/common/errors/domain-error';
import { normalizeOptionalText } from '@core/common/input-normalize/input-normalize.policy';
import { normalizeBusinessDateTime } from '@core/common/time/time-normalize.policy';
import { parseTimeInput } from '@core/common/time/time-parse.policy';

export interface NormalizeUpdateContractInput {
  readonly contractId?: unknown;
  readonly contractCurrentStatus?: unknown;
  readonly workOrderNumber?: unknown;
  readonly confirmationMethod?: unknown;
  readonly partyAContractNo?: unknown;
  readonly partyBContractNo?: unknown;
  readonly submissionTime?: unknown;
  readonly confirmationTime?: unknown;
  readonly contractSignDate?: unknown;
  readonly partyASignDate?: unknown;
  readonly partyBSignDate?: unknown;
  readonly orderTime?: unknown;
  readonly signLocation?: unknown;
  readonly additionalTerms?: unknown;
  readonly disputeResolutionMethod?: unknown;
  readonly filingMethod?: unknown;
  readonly filingParty?: unknown;
  readonly partyBTerminationBefore30?: unknown;
  readonly partyBTerminationOther?: unknown;
  readonly partyBTerminationActive?: unknown;
  readonly partyATerminationBefore30?: unknown;
  readonly partyATerminationIn30?: unknown;
  readonly partyATerminationActive?: unknown;
  readonly originalCopies?: unknown;
  readonly duplicateCopies?: unknown;
  readonly partyAId?: unknown;
  readonly partyACustom?: unknown;
  readonly partyACustomCompany?: unknown;
  readonly partyACustomCreditCode?: unknown;
  readonly partyACustomLegalPerson?: unknown;
  readonly partyACustomAddress?: unknown;
  readonly partyACustomBank?: unknown;
  readonly partyACustomBankAccount?: unknown;
  readonly partyACustomContactPerson?: unknown;
  readonly partyACustomContactPhone?: unknown;
  readonly partyBId?: unknown;
  readonly quotation?: unknown;
}

export interface UpdateQuotationDetailsNormalizedInput {
  readonly fixedPriceRatio?: number;
  readonly marketTransactionPrice?: number | null;
  readonly priceLimit?: number | null;
  readonly psPropSharingRatio?: number;
  readonly psDistRefPrice?: number | null;
  readonly psLongTermTransRatio?: number | null;
  readonly psPartyAPropBelowLongTerm?: number | null;
  readonly psPartyBPropBelowLongTerm?: number | null;
  readonly psPartyAPropAboveLongTerm?: number | null;
  readonly psPartyBPropAboveLongTerm?: number | null;
  readonly psMonthlyBidRatio?: number | null;
  readonly psPartyAPropBelowMonthlyBid?: number | null;
  readonly psPartyBPropBelowMonthlyBid?: number | null;
  readonly psPartyAPropAboveMonthlyBid?: number | null;
  readonly psPartyBPropAboveMonthlyBid?: number | null;
  readonly psAgentProcRatio?: number | null;
  readonly psPartyAPropBelowAgentProc?: number | null;
  readonly psPartyBPropBelowAgentProc?: number | null;
  readonly psPartyAPropAboveAgentProc?: number | null;
  readonly psPartyBPropAboveAgentProc?: number | null;
  readonly psIntraMonthRatio?: number | null;
  readonly psPartyAPropBelowIntraMonth?: number | null;
  readonly psPartyBPropBelowIntraMonth?: number | null;
  readonly psPartyAPropAboveIntraMonth?: number | null;
  readonly psPartyBPropAboveIntraMonth?: number | null;
  readonly psLongTermTransLimit?: number | null;
  readonly psMonthlyBidLimit?: number | null;
  readonly psAgentProcLimit?: number | null;
  readonly psIntraMonthLimit?: number | null;
  readonly pdPriceDiffFlucRatio?: number;
  readonly pdLongTermTransRatio?: number | null;
  readonly pdLongTermTransAvgPrice?: number | null;
  readonly pdLongTermTransDirection?: boolean;
  readonly pdMonthlyBidRatio?: number | null;
  readonly pdMonthlyBidClearPrice?: number | null;
  readonly pdMonthlyBidDirection?: boolean;
  readonly pdAgentProcRatio?: number | null;
  readonly pdAgentAvgPrice?: number | null;
  readonly pdAgentDirection?: boolean;
  readonly pdIntraMonthRatio?: number | null;
  readonly pdIntraMonthAvgPrice?: number | null;
  readonly pdIntraMonthDirection?: boolean;
  readonly pdLongTermTransLimit?: number | null;
  readonly pdMonthlyBidLimit?: number | null;
  readonly pdAgentProcLimit?: number | null;
  readonly pdIntraMonthLimit?: number | null;
}

export interface UpdateQuotationNormalizedInput {
  readonly quoteTypeId?: 1 | 2 | 3;
  readonly greenElecAllow?: boolean;
  readonly greenElecPrice?: number | null;
  readonly tradeStartTime?: string;
  readonly tradeEndTime?: string;
  readonly totalElectricity?: number;
  readonly monthlyElectricity?: Record<string, number>;
  readonly electricityDeviation?: number | null;
  readonly positiveDeviationRatio?: number | null;
  readonly positiveDeviationPrice?: number | null;
  readonly negativeDeviationRatio?: number | null;
  readonly negativeDeviationPrice?: number | null;
  readonly standardCurveMethod?: boolean;
  readonly curveModifyDays?: number | null;
  readonly curveDeviation?: number | null;
  readonly curvePositiveRatio?: number | null;
  readonly curvePositivePrice?: number | null;
  readonly curveNegativeRatio?: number | null;
  readonly curveNegativePrice?: number | null;
  readonly quoteDetails?: UpdateQuotationDetailsNormalizedInput;
}

export interface UpdateContractNormalizedInput {
  readonly contractId: number;
  readonly contractCurrentStatus?: string;
  readonly workOrderNumber?: string | null;
  readonly confirmationMethod?: string;
  readonly partyAContractNo?: string;
  readonly partyBContractNo?: string;
  readonly submissionTime?: Date | null;
  readonly confirmationTime?: Date | null;
  readonly contractSignDate?: string | null;
  readonly partyASignDate?: string;
  readonly partyBSignDate?: string;
  readonly orderTime?: Date | null;
  readonly signLocation?: string;
  readonly additionalTerms?: string | null;
  readonly disputeResolutionMethod?: string;
  readonly filingMethod?: string;
  readonly filingParty?: string | null;
  readonly partyBTerminationBefore30?: number | null;
  readonly partyBTerminationOther?: number | null;
  readonly partyBTerminationActive?: number | null;
  readonly partyATerminationBefore30?: number | null;
  readonly partyATerminationIn30?: number | null;
  readonly partyATerminationActive?: number | null;
  readonly originalCopies?: number;
  readonly duplicateCopies?: number;
  readonly partyAId?: number;
  readonly partyACustom?: boolean;
  readonly partyACustomCompany?: string | null;
  readonly partyACustomCreditCode?: string | null;
  readonly partyACustomLegalPerson?: string | null;
  readonly partyACustomAddress?: string | null;
  readonly partyACustomBank?: string | null;
  readonly partyACustomBankAccount?: string | null;
  readonly partyACustomContactPerson?: string | null;
  readonly partyACustomContactPhone?: string | null;
  readonly partyBId?: number;
  readonly quotation?: UpdateQuotationNormalizedInput;
}

export function normalizeUpdateContractInput(
  input: NormalizeUpdateContractInput,
): UpdateContractNormalizedInput {
  if (
    typeof input.contractId !== 'number' ||
    !Number.isInteger(input.contractId) ||
    input.contractId < 1
  ) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, '合同 ID 必须是大于 0 的整数');
  }

  return {
    contractId: input.contractId,
    ...pickOptionalRequiredText(
      'contractCurrentStatus',
      input.contractCurrentStatus,
      '合同当前状态',
    ),
    ...pickOptionalNullableText('workOrderNumber', input.workOrderNumber, '工单编号'),
    ...pickOptionalRequiredText('confirmationMethod', input.confirmationMethod, '确认方式'),
    ...pickOptionalRequiredText('partyAContractNo', input.partyAContractNo, '甲方合同编号'),
    ...pickOptionalRequiredText('partyBContractNo', input.partyBContractNo, '乙方合同编号'),
    ...pickOptionalBusinessDateTime('submissionTime', input.submissionTime, '提交时间'),
    ...pickOptionalBusinessDateTime('confirmationTime', input.confirmationTime, '确认时间'),
    ...pickOptionalDate('contractSignDate', input.contractSignDate, '合同签署日期'),
    ...pickOptionalRequiredDate('partyASignDate', input.partyASignDate, '甲方签署日期'),
    ...pickOptionalRequiredDate('partyBSignDate', input.partyBSignDate, '乙方签署日期'),
    ...pickOptionalBusinessDateTime('orderTime', input.orderTime, '下单时间'),
    ...pickOptionalRequiredText('signLocation', input.signLocation, '签署地点'),
    ...pickOptionalNullableText('additionalTerms', input.additionalTerms, '附加条款'),
    ...pickOptionalRequiredText(
      'disputeResolutionMethod',
      input.disputeResolutionMethod,
      '争议解决方式',
    ),
    ...pickOptionalRequiredText('filingMethod', input.filingMethod, '备案方式'),
    ...pickOptionalNullableText('filingParty', input.filingParty, '备案方'),
    ...pickOptionalNumber(
      'partyBTerminationBefore30',
      input.partyBTerminationBefore30,
      '乙方提前 30 天终止违约金',
    ),
    ...pickOptionalNumber(
      'partyBTerminationOther',
      input.partyBTerminationOther,
      '乙方其他情况终止违约金',
    ),
    ...pickOptionalNumber(
      'partyBTerminationActive',
      input.partyBTerminationActive,
      '乙方主动终止违约金',
    ),
    ...pickOptionalNumber(
      'partyATerminationBefore30',
      input.partyATerminationBefore30,
      '甲方提前 30 天终止违约金',
    ),
    ...pickOptionalNumber(
      'partyATerminationIn30',
      input.partyATerminationIn30,
      '甲方 30 天内终止违约金',
    ),
    ...pickOptionalNumber(
      'partyATerminationActive',
      input.partyATerminationActive,
      '甲方主动终止违约金',
    ),
    ...pickOptionalInteger('originalCopies', input.originalCopies, '正本份数', 1),
    ...pickOptionalInteger('duplicateCopies', input.duplicateCopies, '副本份数', 0),
    ...pickOptionalPositiveInt('partyAId', input.partyAId, '甲方 ID'),
    ...pickOptionalBoolean('partyACustom', input.partyACustom, '是否使用自定义甲方信息'),
    ...pickOptionalNullableText(
      'partyACustomCompany',
      input.partyACustomCompany,
      '自定义甲方公司名称',
    ),
    ...pickOptionalNullableText(
      'partyACustomCreditCode',
      input.partyACustomCreditCode,
      '自定义甲方信用代码',
    ),
    ...pickOptionalNullableText(
      'partyACustomLegalPerson',
      input.partyACustomLegalPerson,
      '自定义甲方法人',
    ),
    ...pickOptionalNullableText('partyACustomAddress', input.partyACustomAddress, '自定义甲方地址'),
    ...pickOptionalNullableText('partyACustomBank', input.partyACustomBank, '自定义甲方开户银行'),
    ...pickOptionalNullableText(
      'partyACustomBankAccount',
      input.partyACustomBankAccount,
      '自定义甲方银行账号',
    ),
    ...pickOptionalNullableText(
      'partyACustomContactPerson',
      input.partyACustomContactPerson,
      '自定义甲方联系人',
    ),
    ...pickOptionalNullableText(
      'partyACustomContactPhone',
      input.partyACustomContactPhone,
      '自定义甲方联系电话',
    ),
    ...pickOptionalPositiveInt('partyBId', input.partyBId, '乙方 ID'),
    ...(typeof input.quotation === 'undefined'
      ? {}
      : { quotation: normalizeUpdateQuotationInput(input.quotation) }),
  };
}

function normalizeUpdateQuotationInput(input: unknown): UpdateQuotationNormalizedInput {
  if (input === null) {
    return {};
  }
  const record = ensureRecord(input, '报价信息');

  return {
    ...pickOptionalQuoteTypeId(record.quoteTypeId),
    ...pickOptionalBoolean('greenElecAllow', record.greenElecAllow, '是否允许绿电'),
    ...pickOptionalNumber('greenElecPrice', record.greenElecPrice, '绿电价格'),
    ...pickOptionalRequiredDate('tradeStartTime', record.tradeStartTime, '交易开始日期'),
    ...pickOptionalRequiredDate('tradeEndTime', record.tradeEndTime, '交易结束日期'),
    ...pickOptionalRequiredNumber('totalElectricity', record.totalElectricity, '预计总电量'),
    ...(typeof record.monthlyElectricity === 'undefined'
      ? {}
      : { monthlyElectricity: normalizeMonthlyElectricity(record.monthlyElectricity) }),
    ...pickOptionalNumber('electricityDeviation', record.electricityDeviation, '电量偏差'),
    ...pickOptionalNumber('positiveDeviationRatio', record.positiveDeviationRatio, '正偏差比例'),
    ...pickOptionalNumber('positiveDeviationPrice', record.positiveDeviationPrice, '正偏差价格'),
    ...pickOptionalNumber('negativeDeviationRatio', record.negativeDeviationRatio, '负偏差比例'),
    ...pickOptionalNumber('negativeDeviationPrice', record.negativeDeviationPrice, '负偏差价格'),
    ...pickOptionalBoolean('standardCurveMethod', record.standardCurveMethod, '是否标准曲线方式'),
    ...pickOptionalInteger('curveModifyDays', record.curveModifyDays, '曲线修正天数'),
    ...pickOptionalNumber('curveDeviation', record.curveDeviation, '曲线偏差'),
    ...pickOptionalNumber('curvePositiveRatio', record.curvePositiveRatio, '曲线正偏差比例'),
    ...pickOptionalNumber('curvePositivePrice', record.curvePositivePrice, '曲线正偏差价格'),
    ...pickOptionalNumber('curveNegativeRatio', record.curveNegativeRatio, '曲线负偏差比例'),
    ...pickOptionalNumber('curveNegativePrice', record.curveNegativePrice, '曲线负偏差价格'),
    ...(typeof record.quoteDetails === 'undefined' || record.quoteDetails === null
      ? {}
      : { quoteDetails: normalizeUpdateQuotationDetails(record.quoteDetails) }),
  };
}

function normalizeUpdateQuotationDetails(input: unknown): UpdateQuotationDetailsNormalizedInput {
  const record = ensureRecord(input, '报价详情');

  return {
    ...pickOptionalRequiredNumber('fixedPriceRatio', record.fixedPriceRatio, '固定价格比例'),
    ...pickOptionalNumber(
      'marketTransactionPrice',
      record.marketTransactionPrice,
      '市场化交易价格',
    ),
    ...pickOptionalNumber('priceLimit', record.priceLimit, '价格上限'),
    ...pickOptionalRequiredNumber('psPropSharingRatio', record.psPropSharingRatio, '分成比例'),
    ...pickOptionalNumber('psDistRefPrice', record.psDistRefPrice, '配电参考价'),
    ...pickOptionalNumber('psLongTermTransRatio', record.psLongTermTransRatio, '长期交易比例'),
    ...pickOptionalNumber(
      'psPartyAPropBelowLongTerm',
      record.psPartyAPropBelowLongTerm,
      '长期交易下浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropBelowLongTerm',
      record.psPartyBPropBelowLongTerm,
      '长期交易下浮乙方分成',
    ),
    ...pickOptionalNumber(
      'psPartyAPropAboveLongTerm',
      record.psPartyAPropAboveLongTerm,
      '长期交易上浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropAboveLongTerm',
      record.psPartyBPropAboveLongTerm,
      '长期交易上浮乙方分成',
    ),
    ...pickOptionalNumber('psMonthlyBidRatio', record.psMonthlyBidRatio, '月度竞价比例'),
    ...pickOptionalNumber(
      'psPartyAPropBelowMonthlyBid',
      record.psPartyAPropBelowMonthlyBid,
      '月度竞价下浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropBelowMonthlyBid',
      record.psPartyBPropBelowMonthlyBid,
      '月度竞价下浮乙方分成',
    ),
    ...pickOptionalNumber(
      'psPartyAPropAboveMonthlyBid',
      record.psPartyAPropAboveMonthlyBid,
      '月度竞价上浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropAboveMonthlyBid',
      record.psPartyBPropAboveMonthlyBid,
      '月度竞价上浮乙方分成',
    ),
    ...pickOptionalNumber('psAgentProcRatio', record.psAgentProcRatio, '代理交易比例'),
    ...pickOptionalNumber(
      'psPartyAPropBelowAgentProc',
      record.psPartyAPropBelowAgentProc,
      '代理交易下浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropBelowAgentProc',
      record.psPartyBPropBelowAgentProc,
      '代理交易下浮乙方分成',
    ),
    ...pickOptionalNumber(
      'psPartyAPropAboveAgentProc',
      record.psPartyAPropAboveAgentProc,
      '代理交易上浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropAboveAgentProc',
      record.psPartyBPropAboveAgentProc,
      '代理交易上浮乙方分成',
    ),
    ...pickOptionalNumber('psIntraMonthRatio', record.psIntraMonthRatio, '月内挂牌比例'),
    ...pickOptionalNumber(
      'psPartyAPropBelowIntraMonth',
      record.psPartyAPropBelowIntraMonth,
      '月内挂牌下浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropBelowIntraMonth',
      record.psPartyBPropBelowIntraMonth,
      '月内挂牌下浮乙方分成',
    ),
    ...pickOptionalNumber(
      'psPartyAPropAboveIntraMonth',
      record.psPartyAPropAboveIntraMonth,
      '月内挂牌上浮甲方分成',
    ),
    ...pickOptionalNumber(
      'psPartyBPropAboveIntraMonth',
      record.psPartyBPropAboveIntraMonth,
      '月内挂牌上浮乙方分成',
    ),
    ...pickOptionalNumber('psLongTermTransLimit', record.psLongTermTransLimit, '长期交易限价'),
    ...pickOptionalNumber('psMonthlyBidLimit', record.psMonthlyBidLimit, '月度竞价限价'),
    ...pickOptionalNumber('psAgentProcLimit', record.psAgentProcLimit, '代理交易限价'),
    ...pickOptionalNumber('psIntraMonthLimit', record.psIntraMonthLimit, '月内挂牌限价'),
    ...pickOptionalRequiredNumber(
      'pdPriceDiffFlucRatio',
      record.pdPriceDiffFlucRatio,
      '价差浮动比例',
    ),
    ...pickOptionalNumber('pdLongTermTransRatio', record.pdLongTermTransRatio, '长期交易比例'),
    ...pickOptionalNumber(
      'pdLongTermTransAvgPrice',
      record.pdLongTermTransAvgPrice,
      '长期交易均价',
    ),
    ...pickOptionalBoolean(
      'pdLongTermTransDirection',
      record.pdLongTermTransDirection,
      '长期交易方向',
    ),
    ...pickOptionalNumber('pdMonthlyBidRatio', record.pdMonthlyBidRatio, '月度竞价比例'),
    ...pickOptionalNumber(
      'pdMonthlyBidClearPrice',
      record.pdMonthlyBidClearPrice,
      '月度竞价出清价',
    ),
    ...pickOptionalBoolean('pdMonthlyBidDirection', record.pdMonthlyBidDirection, '月度竞价方向'),
    ...pickOptionalNumber('pdAgentProcRatio', record.pdAgentProcRatio, '代理交易比例'),
    ...pickOptionalNumber('pdAgentAvgPrice', record.pdAgentAvgPrice, '代理交易均价'),
    ...pickOptionalBoolean('pdAgentDirection', record.pdAgentDirection, '代理交易方向'),
    ...pickOptionalNumber('pdIntraMonthRatio', record.pdIntraMonthRatio, '月内挂牌比例'),
    ...pickOptionalNumber('pdIntraMonthAvgPrice', record.pdIntraMonthAvgPrice, '月内挂牌均价'),
    ...pickOptionalBoolean('pdIntraMonthDirection', record.pdIntraMonthDirection, '月内挂牌方向'),
    ...pickOptionalNumber('pdLongTermTransLimit', record.pdLongTermTransLimit, '长期交易限价'),
    ...pickOptionalNumber('pdMonthlyBidLimit', record.pdMonthlyBidLimit, '月度竞价限价'),
    ...pickOptionalNumber('pdAgentProcLimit', record.pdAgentProcLimit, '代理交易限价'),
    ...pickOptionalNumber('pdIntraMonthLimit', record.pdIntraMonthLimit, '月内挂牌限价'),
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

function normalizeOptionalNumber(input: unknown, fieldName: string): number | null | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (input === null) {
    return null;
  }
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, `${fieldName} 必须是数字`);
  }
  return input;
}

function normalizeOptionalRequiredNumber(input: unknown, fieldName: string): number | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, `${fieldName} 必须是数字`);
  }
  return input;
}

function normalizeOptionalInteger(
  input: unknown,
  fieldName: string,
  min?: number,
): number | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input !== 'number' || !Number.isInteger(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, `${fieldName} 必须是整数`);
  }
  if (typeof min === 'number' && input < min) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      `${fieldName} 不能小于 ${String(min)}`,
    );
  }
  return input;
}

function normalizeOptionalPositiveInt(input: unknown, fieldName: string): number | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input !== 'number' || !Number.isInteger(input) || input < 1) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      `${fieldName} 必须是大于 0 的整数`,
    );
  }
  return input;
}

function normalizeOptionalBoolean(input: unknown, fieldName: string): boolean | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input !== 'boolean') {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_ENUM_VALUE, `${fieldName} 取值非法`);
  }
  return input;
}

function normalizeOptionalDate(input: unknown, fieldName: string): string | null | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (input === null) {
    return null;
  }
  const parsed = parseTimeInput(input);
  if (parsed instanceof DomainError || parsed.kind !== 'date') {
    throw new DomainError(TIME_ERROR.INVALID_TIME_INPUT, `${fieldName} 必须是 YYYY-MM-DD 日期`);
  }
  return formatDateParts(parsed.parts.year, parsed.parts.month, parsed.parts.day);
}

function normalizeOptionalRequiredDate(input: unknown, fieldName: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }
  const normalized = normalizeOptionalDate(input, fieldName);
  if (typeof normalized !== 'string') {
    throw new DomainError(TIME_ERROR.INVALID_TIME_INPUT, `${fieldName} 必须是 YYYY-MM-DD 日期`);
  }
  return normalized;
}

function normalizeOptionalBusinessDateTime(
  input: unknown,
  fieldName: string,
): Date | null | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (input === null) {
    return null;
  }
  const parsed = parseTimeInput(input);
  if (parsed instanceof DomainError) {
    throw new DomainError(TIME_ERROR.INVALID_TIME_INPUT, `${fieldName} 时间格式非法`);
  }
  const normalized = normalizeBusinessDateTime(parsed);
  if (normalized instanceof DomainError) {
    throw new DomainError(normalized.code, `${fieldName}${normalized.message}`);
  }
  return new Date(normalized.epochMilliseconds);
}

function normalizeMonthlyElectricity(input: unknown): Record<string, number> {
  const record = ensureRecord(input, '月度电量');
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = normalizeOptionalText(key, 'reject', { fieldName: '月度电量键名' });
    if (typeof normalizedKey !== 'string') {
      throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT, '月度电量键名必须是字符串');
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, '月度电量值必须是数字');
    }
    normalized[normalizedKey] = value;
  }
  return normalized;
}

function ensureRecord(input: unknown, fieldName: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_TEXT, `${fieldName} 必须是对象`);
  }
  return input as Record<string, unknown>;
}

function formatDateParts(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
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

function pickOptionalNumber<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, number | null>> {
  const normalized = normalizeOptionalNumber(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, number | null>>;
}

function pickOptionalRequiredNumber<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, number>> {
  const normalized = normalizeOptionalRequiredNumber(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, number>>;
}

function pickOptionalInteger<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
  min?: number,
): Partial<Record<Key, number>> {
  const normalized = normalizeOptionalInteger(input, fieldName, min);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, number>>;
}

function pickOptionalPositiveInt<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, number>> {
  const normalized = normalizeOptionalPositiveInt(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, number>>;
}

function pickOptionalBoolean<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, boolean>> {
  const normalized = normalizeOptionalBoolean(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, boolean>>;
}

function pickOptionalDate<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, string | null>> {
  const normalized = normalizeOptionalDate(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, string | null>>;
}

function pickOptionalRequiredDate<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, string>> {
  const normalized = normalizeOptionalRequiredDate(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, string>>;
}

function pickOptionalBusinessDateTime<Key extends string>(
  key: Key,
  input: unknown,
  fieldName: string,
): Partial<Record<Key, Date | null>> {
  const normalized = normalizeOptionalBusinessDateTime(input, fieldName);
  if (typeof normalized === 'undefined') {
    return {};
  }
  return { [key]: normalized } as Partial<Record<Key, Date | null>>;
}

function pickOptionalQuoteTypeId(input: unknown): Partial<Record<'quoteTypeId', 1 | 2 | 3>> {
  if (typeof input === 'undefined') {
    return {};
  }
  if (input === 1 || input === 2 || input === 3) {
    return { quoteTypeId: input };
  }
  throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_ENUM_VALUE, '报价类型 ID 取值非法');
}
