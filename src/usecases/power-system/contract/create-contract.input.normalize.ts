import { DomainError, INPUT_NORMALIZE_ERROR, TIME_ERROR } from '@core/common/errors/domain-error';
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from '@core/common/input-normalize/input-normalize.policy';
import { normalizeBusinessDateTime } from '@core/common/time/time-normalize.policy';
import { parseTimeInput } from '@core/common/time/time-parse.policy';

export interface NormalizeCreateContractInput {
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
  readonly contractCurrentStatus?: unknown;
  readonly quotation?: unknown;
}

export interface CreateContractNormalizedInput {
  readonly contractCurrentStatus: string;
  readonly workOrderNumber: string | null;
  readonly confirmationMethod: string;
  readonly partyAContractNo: string;
  readonly partyBContractNo: string;
  readonly submissionTime: Date | null;
  readonly confirmationTime: Date | null;
  readonly contractSignDate: string | null;
  readonly partyASignDate: string;
  readonly partyBSignDate: string;
  readonly orderTime: Date | null;
  readonly signLocation: string;
  readonly additionalTerms: string | null;
  readonly disputeResolutionMethod: string;
  readonly filingMethod: string;
  readonly filingParty: string;
  readonly partyBTerminationBefore30: number | null;
  readonly partyBTerminationOther: number | null;
  readonly partyBTerminationActive: number | null;
  readonly partyATerminationBefore30: number | null;
  readonly partyATerminationIn30: number | null;
  readonly partyATerminationActive: number | null;
  readonly originalCopies: number;
  readonly duplicateCopies: number;
  readonly partyAId: number;
  readonly partyACustom: boolean;
  readonly partyACustomCompany: string | null;
  readonly partyACustomCreditCode: string | null;
  readonly partyACustomLegalPerson: string | null;
  readonly partyACustomAddress: string | null;
  readonly partyACustomBank: string | null;
  readonly partyACustomBankAccount: string | null;
  readonly partyACustomContactPerson: string | null;
  readonly partyACustomContactPhone: string | null;
  readonly partyBId: number;
  readonly quotation: CreateQuotationNormalizedInput;
}

type QuoteTypeId = 1 | 2 | 3;

interface BaseQuoteDetails {
  readonly quoteTypeId: QuoteTypeId;
}

export interface FixedPriceDetailsNormalizedInput extends BaseQuoteDetails {
  readonly quoteTypeId: 1;
  readonly quoteDetails: {
    readonly fixedPriceRatio: number;
    readonly marketTransactionPrice: number | null;
    readonly priceLimit: number | null;
  };
}

export interface ProportionSharingDetailsNormalizedInput extends BaseQuoteDetails {
  readonly quoteTypeId: 2;
  readonly quoteDetails: {
    readonly psPropSharingRatio: number;
    readonly psDistRefPrice: number | null;
    readonly psLongTermTransRatio: number | null;
    readonly psPartyAPropBelowLongTerm: number | null;
    readonly psPartyBPropBelowLongTerm: number | null;
    readonly psPartyAPropAboveLongTerm: number | null;
    readonly psPartyBPropAboveLongTerm: number | null;
    readonly psMonthlyBidRatio: number | null;
    readonly psPartyAPropBelowMonthlyBid: number | null;
    readonly psPartyBPropBelowMonthlyBid: number | null;
    readonly psPartyAPropAboveMonthlyBid: number | null;
    readonly psPartyBPropAboveMonthlyBid: number | null;
    readonly psAgentProcRatio: number | null;
    readonly psPartyAPropBelowAgentProc: number | null;
    readonly psPartyBPropBelowAgentProc: number | null;
    readonly psPartyAPropAboveAgentProc: number | null;
    readonly psPartyBPropAboveAgentProc: number | null;
    readonly psIntraMonthRatio: number | null;
    readonly psPartyAPropBelowIntraMonth: number | null;
    readonly psPartyBPropBelowIntraMonth: number | null;
    readonly psPartyAPropAboveIntraMonth: number | null;
    readonly psPartyBPropAboveIntraMonth: number | null;
    readonly psLongTermTransLimit: number | null;
    readonly psMonthlyBidLimit: number | null;
    readonly psAgentProcLimit: number | null;
    readonly psIntraMonthLimit: number | null;
  };
}

export interface PriceDifferenceDetailsNormalizedInput extends BaseQuoteDetails {
  readonly quoteTypeId: 3;
  readonly quoteDetails: {
    readonly pdPriceDiffFlucRatio: number;
    readonly pdLongTermTransRatio: number | null;
    readonly pdLongTermTransAvgPrice: number | null;
    readonly pdLongTermTransDirection: boolean;
    readonly pdMonthlyBidRatio: number | null;
    readonly pdMonthlyBidClearPrice: number | null;
    readonly pdMonthlyBidDirection: boolean;
    readonly pdAgentProcRatio: number | null;
    readonly pdAgentAvgPrice: number | null;
    readonly pdAgentDirection: boolean;
    readonly pdIntraMonthRatio: number | null;
    readonly pdIntraMonthAvgPrice: number | null;
    readonly pdIntraMonthDirection: boolean;
    readonly pdLongTermTransLimit: number | null;
    readonly pdMonthlyBidLimit: number | null;
    readonly pdAgentProcLimit: number | null;
    readonly pdIntraMonthLimit: number | null;
  };
}

export type QuoteDetailsNormalizedInput =
  | FixedPriceDetailsNormalizedInput
  | ProportionSharingDetailsNormalizedInput
  | PriceDifferenceDetailsNormalizedInput;

interface CreateQuotationBaseNormalizedInput {
  readonly greenElecAllow: boolean;
  readonly greenElecPrice: number | null;
  readonly tradeStartTime: string;
  readonly tradeEndTime: string;
  readonly totalElectricity: number;
  readonly monthlyElectricity: Record<string, number>;
  readonly electricityDeviation: number | null;
  readonly positiveDeviationRatio: number | null;
  readonly positiveDeviationPrice: number | null;
  readonly negativeDeviationRatio: number | null;
  readonly negativeDeviationPrice: number | null;
  readonly standardCurveMethod: boolean;
  readonly curveModifyDays: number | null;
  readonly curveDeviation: number | null;
  readonly curvePositiveRatio: number | null;
  readonly curvePositivePrice: number | null;
  readonly curveNegativeRatio: number | null;
  readonly curveNegativePrice: number | null;
}

export type CreateQuotationNormalizedInput = CreateQuotationBaseNormalizedInput &
  QuoteDetailsNormalizedInput;

export function normalizeCreateContractInput(
  input: NormalizeCreateContractInput,
): CreateContractNormalizedInput {
  const partyACustom = normalizeBoolean(input.partyACustom, false);
  const filingMethod =
    normalizeOptionalText(input.filingMethod, 'to_null', { fieldName: '备案方式' }) ?? '2';
  const filingParty =
    normalizeOptionalText(input.filingParty, 'to_null', { fieldName: '备案方' }) ??
    (filingMethod === '2' ? '乙' : null);

  const partyAId = normalizePartyAId(input.partyAId, partyACustom);
  const partyACustomCompany = normalizeNullableText(
    input.partyACustomCompany,
    '自定义甲方公司名称',
  );
  if (partyACustom && !partyACustomCompany) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY, '自定义甲方公司名称不能为空');
  }

  return {
    contractCurrentStatus:
      normalizeOptionalText(input.contractCurrentStatus, 'to_null', {
        fieldName: '合同当前状态',
      }) ?? '草稿',
    workOrderNumber: normalizeNullableText(input.workOrderNumber, '工单编号'),
    confirmationMethod:
      normalizeOptionalText(input.confirmationMethod, 'to_null', { fieldName: '确认方式' }) ??
      '电子确认',
    partyAContractNo: normalizeRequiredText(input.partyAContractNo, { fieldName: '甲方合同编号' }),
    partyBContractNo: normalizeRequiredText(input.partyBContractNo, { fieldName: '乙方合同编号' }),
    submissionTime: normalizeOptionalBusinessDateTime(input.submissionTime, '提交时间'),
    confirmationTime: normalizeOptionalBusinessDateTime(input.confirmationTime, '确认时间'),
    contractSignDate: normalizeOptionalDate(input.contractSignDate, '合同签署日期'),
    partyASignDate: normalizeRequiredDate(input.partyASignDate, '甲方签署日期'),
    partyBSignDate: normalizeRequiredDate(input.partyBSignDate, '乙方签署日期'),
    orderTime: normalizeOptionalBusinessDateTime(input.orderTime, '下单时间'),
    signLocation: normalizeRequiredText(input.signLocation, { fieldName: '签署地点' }),
    additionalTerms: normalizeNullableText(input.additionalTerms, '附加条款'),
    disputeResolutionMethod:
      normalizeOptionalText(input.disputeResolutionMethod, 'to_null', {
        fieldName: '争议解决方式',
      }) ?? '2',
    filingMethod,
    filingParty: filingParty ?? '乙',
    partyBTerminationBefore30: normalizeOptionalNumber(
      input.partyBTerminationBefore30,
      '乙方提前 30 天终止违约金',
    ),
    partyBTerminationOther: normalizeOptionalNumber(
      input.partyBTerminationOther,
      '乙方其他情况终止违约金',
    ),
    partyBTerminationActive: normalizeOptionalNumber(
      input.partyBTerminationActive,
      '乙方主动终止违约金',
    ),
    partyATerminationBefore30: normalizeOptionalNumber(
      input.partyATerminationBefore30,
      '甲方提前 30 天终止违约金',
    ),
    partyATerminationIn30: normalizeOptionalNumber(
      input.partyATerminationIn30,
      '甲方 30 天内终止违约金',
    ),
    partyATerminationActive: normalizeOptionalNumber(
      input.partyATerminationActive,
      '甲方主动终止违约金',
    ),
    originalCopies: normalizeOptionalInteger(input.originalCopies, '正本份数', 2, 1) ?? 2,
    duplicateCopies: normalizeOptionalInteger(input.duplicateCopies, '副本份数', 1, 0) ?? 1,
    partyAId,
    partyACustom,
    partyACustomCompany,
    partyACustomCreditCode: normalizeNullableText(
      input.partyACustomCreditCode,
      '自定义甲方信用代码',
    ),
    partyACustomLegalPerson: normalizeNullableText(input.partyACustomLegalPerson, '自定义甲方法人'),
    partyACustomAddress: normalizeNullableText(input.partyACustomAddress, '自定义甲方地址'),
    partyACustomBank: normalizeNullableText(input.partyACustomBank, '自定义甲方开户银行'),
    partyACustomBankAccount: normalizeNullableText(
      input.partyACustomBankAccount,
      '自定义甲方银行账号',
    ),
    partyACustomContactPerson: normalizeNullableText(
      input.partyACustomContactPerson,
      '自定义甲方联系人',
    ),
    partyACustomContactPhone: normalizeNullableText(
      input.partyACustomContactPhone,
      '自定义甲方联系电话',
    ),
    partyBId: normalizeRequiredPositiveInt(input.partyBId, '乙方 ID'),
    quotation: normalizeCreateQuotationInput(input.quotation),
  };
}

function normalizeCreateQuotationInput(input: unknown): CreateQuotationNormalizedInput {
  const record = ensureRecord(input, '报价信息');
  const quoteTypeId = normalizeQuoteTypeId(record.quoteTypeId);
  const greenElecAllow = normalizeBoolean(record.greenElecAllow, true);
  const greenElecPrice = normalizeOptionalNumber(record.greenElecPrice, '绿电价格');

  if (greenElecAllow && greenElecPrice === null) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      '当允许绿电时，绿电价格必须提供',
    );
  }

  const base = {
    greenElecAllow,
    greenElecPrice,
    quoteTypeId,
    tradeStartTime: normalizeRequiredDate(record.tradeStartTime, '交易开始日期'),
    tradeEndTime: normalizeRequiredDate(record.tradeEndTime, '交易结束日期'),
    totalElectricity: normalizeRequiredNumber(record.totalElectricity, '预计总电量'),
    monthlyElectricity: normalizeMonthlyElectricity(record.monthlyElectricity),
    electricityDeviation: normalizeOptionalNumber(record.electricityDeviation, '电量偏差'),
    positiveDeviationRatio: normalizeOptionalNumber(record.positiveDeviationRatio, '正偏差比例'),
    positiveDeviationPrice: normalizeOptionalNumber(record.positiveDeviationPrice, '正偏差价格'),
    negativeDeviationRatio: normalizeOptionalNumber(record.negativeDeviationRatio, '负偏差比例'),
    negativeDeviationPrice: normalizeOptionalNumber(record.negativeDeviationPrice, '负偏差价格'),
    standardCurveMethod: normalizeBoolean(record.standardCurveMethod, false),
    curveModifyDays: normalizeOptionalInteger(record.curveModifyDays, '曲线修正天数'),
    curveDeviation: normalizeOptionalNumber(record.curveDeviation, '曲线偏差'),
    curvePositiveRatio: normalizeOptionalNumber(record.curvePositiveRatio, '曲线正偏差比例'),
    curvePositivePrice: normalizeOptionalNumber(record.curvePositivePrice, '曲线正偏差价格'),
    curveNegativeRatio: normalizeOptionalNumber(record.curveNegativeRatio, '曲线负偏差比例'),
    curveNegativePrice: normalizeOptionalNumber(record.curveNegativePrice, '曲线负偏差价格'),
  };

  if (quoteTypeId === 1) {
    const details = ensureRecord(record.quoteDetails, '固定价格报价详情');
    return {
      ...base,
      quoteTypeId,
      quoteDetails: {
        fixedPriceRatio:
          normalizeOptionalNumber(details.fixedPriceRatio, '固定价格比例', 100) ?? 100,
        marketTransactionPrice: normalizeOptionalNumber(
          details.marketTransactionPrice,
          '市场化交易价格',
        ),
        priceLimit: normalizeOptionalNumber(details.priceLimit, '价格上限'),
      },
    };
  }

  if (quoteTypeId === 2) {
    const details = ensureRecord(record.quoteDetails, '比例分成报价详情');
    return {
      ...base,
      quoteTypeId,
      quoteDetails: {
        psPropSharingRatio:
          normalizeOptionalNumber(details.psPropSharingRatio, '分成比例', 100) ?? 100,
        psDistRefPrice: normalizeOptionalNumber(details.psDistRefPrice, '配电参考价'),
        psLongTermTransRatio: normalizeOptionalNumber(details.psLongTermTransRatio, '长期交易比例'),
        psPartyAPropBelowLongTerm: normalizeOptionalNumber(
          details.psPartyAPropBelowLongTerm,
          '长期交易下浮甲方分成',
        ),
        psPartyBPropBelowLongTerm: normalizeOptionalNumber(
          details.psPartyBPropBelowLongTerm,
          '长期交易下浮乙方分成',
        ),
        psPartyAPropAboveLongTerm: normalizeOptionalNumber(
          details.psPartyAPropAboveLongTerm,
          '长期交易上浮甲方分成',
        ),
        psPartyBPropAboveLongTerm: normalizeOptionalNumber(
          details.psPartyBPropAboveLongTerm,
          '长期交易上浮乙方分成',
        ),
        psMonthlyBidRatio: normalizeOptionalNumber(details.psMonthlyBidRatio, '月度竞价比例'),
        psPartyAPropBelowMonthlyBid: normalizeOptionalNumber(
          details.psPartyAPropBelowMonthlyBid,
          '月度竞价下浮甲方分成',
        ),
        psPartyBPropBelowMonthlyBid: normalizeOptionalNumber(
          details.psPartyBPropBelowMonthlyBid,
          '月度竞价下浮乙方分成',
        ),
        psPartyAPropAboveMonthlyBid: normalizeOptionalNumber(
          details.psPartyAPropAboveMonthlyBid,
          '月度竞价上浮甲方分成',
        ),
        psPartyBPropAboveMonthlyBid: normalizeOptionalNumber(
          details.psPartyBPropAboveMonthlyBid,
          '月度竞价上浮乙方分成',
        ),
        psAgentProcRatio: normalizeOptionalNumber(details.psAgentProcRatio, '代理交易比例'),
        psPartyAPropBelowAgentProc: normalizeOptionalNumber(
          details.psPartyAPropBelowAgentProc,
          '代理交易下浮甲方分成',
        ),
        psPartyBPropBelowAgentProc: normalizeOptionalNumber(
          details.psPartyBPropBelowAgentProc,
          '代理交易下浮乙方分成',
        ),
        psPartyAPropAboveAgentProc: normalizeOptionalNumber(
          details.psPartyAPropAboveAgentProc,
          '代理交易上浮甲方分成',
        ),
        psPartyBPropAboveAgentProc: normalizeOptionalNumber(
          details.psPartyBPropAboveAgentProc,
          '代理交易上浮乙方分成',
        ),
        psIntraMonthRatio: normalizeOptionalNumber(details.psIntraMonthRatio, '月内挂牌比例'),
        psPartyAPropBelowIntraMonth: normalizeOptionalNumber(
          details.psPartyAPropBelowIntraMonth,
          '月内挂牌下浮甲方分成',
        ),
        psPartyBPropBelowIntraMonth: normalizeOptionalNumber(
          details.psPartyBPropBelowIntraMonth,
          '月内挂牌下浮乙方分成',
        ),
        psPartyAPropAboveIntraMonth: normalizeOptionalNumber(
          details.psPartyAPropAboveIntraMonth,
          '月内挂牌上浮甲方分成',
        ),
        psPartyBPropAboveIntraMonth: normalizeOptionalNumber(
          details.psPartyBPropAboveIntraMonth,
          '月内挂牌上浮乙方分成',
        ),
        psLongTermTransLimit: normalizeOptionalNumber(details.psLongTermTransLimit, '长期交易限价'),
        psMonthlyBidLimit: normalizeOptionalNumber(details.psMonthlyBidLimit, '月度竞价限价'),
        psAgentProcLimit: normalizeOptionalNumber(details.psAgentProcLimit, '代理交易限价'),
        psIntraMonthLimit: normalizeOptionalNumber(details.psIntraMonthLimit, '月内挂牌限价'),
      },
    };
  }

  const details = ensureRecord(record.quoteDetails, '价差浮动报价详情');
  return {
    ...base,
    quoteTypeId,
    quoteDetails: {
      pdPriceDiffFlucRatio:
        normalizeOptionalNumber(details.pdPriceDiffFlucRatio, '价差浮动比例', 100) ?? 100,
      pdLongTermTransRatio: normalizeOptionalNumber(details.pdLongTermTransRatio, '长期交易比例'),
      pdLongTermTransAvgPrice: normalizeOptionalNumber(
        details.pdLongTermTransAvgPrice,
        '长期交易均价',
      ),
      pdLongTermTransDirection: normalizeBoolean(details.pdLongTermTransDirection, true),
      pdMonthlyBidRatio: normalizeOptionalNumber(details.pdMonthlyBidRatio, '月度竞价比例'),
      pdMonthlyBidClearPrice: normalizeOptionalNumber(
        details.pdMonthlyBidClearPrice,
        '月度竞价出清价',
      ),
      pdMonthlyBidDirection: normalizeBoolean(details.pdMonthlyBidDirection, true),
      pdAgentProcRatio: normalizeOptionalNumber(details.pdAgentProcRatio, '代理交易比例'),
      pdAgentAvgPrice: normalizeOptionalNumber(details.pdAgentAvgPrice, '代理交易均价'),
      pdAgentDirection: normalizeBoolean(details.pdAgentDirection, true),
      pdIntraMonthRatio: normalizeOptionalNumber(details.pdIntraMonthRatio, '月内挂牌比例'),
      pdIntraMonthAvgPrice: normalizeOptionalNumber(details.pdIntraMonthAvgPrice, '月内挂牌均价'),
      pdIntraMonthDirection: normalizeBoolean(details.pdIntraMonthDirection, true),
      pdLongTermTransLimit: normalizeOptionalNumber(details.pdLongTermTransLimit, '长期交易限价'),
      pdMonthlyBidLimit: normalizeOptionalNumber(details.pdMonthlyBidLimit, '月度竞价限价'),
      pdAgentProcLimit: normalizeOptionalNumber(details.pdAgentProcLimit, '代理交易限价'),
      pdIntraMonthLimit: normalizeOptionalNumber(details.pdIntraMonthLimit, '月内挂牌限价'),
    },
  };
}

function normalizeNullableText(input: unknown, fieldName: string): string | null {
  return normalizeOptionalText(input, 'to_null', { fieldName }) ?? null;
}

function normalizeOptionalNumber(
  input: unknown,
  fieldName: string,
  fallback?: number,
): number | null {
  if (input === undefined || input === null) {
    return typeof fallback === 'number' ? fallback : null;
  }
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, `${fieldName} 必须是数字`);
  }
  return input;
}

function normalizeRequiredNumber(input: unknown, fieldName: string): number {
  const value = normalizeOptionalNumber(input, fieldName);
  if (value === null) {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE, `${fieldName} 必须提供`);
  }
  return value;
}

function normalizeOptionalInteger(
  input: unknown,
  fieldName: string,
  fallback?: number,
  min?: number,
): number | null {
  if (input === undefined || input === null) {
    if (typeof fallback === 'number') {
      return fallback;
    }
    return null;
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

function normalizeRequiredPositiveInt(input: unknown, fieldName: string): number {
  const value = normalizeOptionalInteger(input, fieldName);
  if (value === null || value < 1) {
    throw new DomainError(
      INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
      `${fieldName} 必须是大于 0 的整数`,
    );
  }
  return value;
}

function normalizeBoolean(input: unknown, fallback: boolean): boolean {
  if (input === undefined || input === null) {
    return fallback;
  }
  if (typeof input !== 'boolean') {
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_ENUM_VALUE, '布尔值字段取值非法');
  }
  return input;
}

function normalizePartyAId(input: unknown, partyACustom: boolean): number {
  if (partyACustom) {
    return -1;
  }
  return normalizeRequiredPositiveInt(input, '甲方 ID');
}

function normalizeQuoteTypeId(input: unknown): QuoteTypeId {
  if (input === 1 || input === 2 || input === 3) {
    return input;
  }
  throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_ENUM_VALUE, '报价类型 ID 取值非法');
}

function normalizeRequiredDate(input: unknown, fieldName: string): string {
  const parsed = parseTimeInput(input);
  if (parsed instanceof DomainError || parsed.kind !== 'date') {
    throw new DomainError(TIME_ERROR.INVALID_TIME_INPUT, `${fieldName} 必须是 YYYY-MM-DD 日期`);
  }
  return formatDateParts(parsed.parts.year, parsed.parts.month, parsed.parts.day);
}

function normalizeOptionalDate(input: unknown, fieldName: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return normalizeRequiredDate(input, fieldName);
}

function normalizeOptionalBusinessDateTime(input: unknown, fieldName: string): Date | null {
  if (input === undefined || input === null) {
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
    const normalizedKey = normalizeRequiredText(key, { fieldName: '月度电量键名' });
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
