import {
  DomainError,
  INPUT_NORMALIZE_ERROR,
  POWER_SYSTEM_ERROR,
} from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { ContractQueryService } from '@modules/power-system/contract/queries/contract.query.service';
import {
  ContractService,
  type ContractTransactionManager,
  type UpdateContractParams,
} from '@modules/power-system/contract/contract.service';
import type {
  ContractDetailView,
  ContractQuotationInfoView,
} from '@modules/power-system/contract/contract.types';
import type { ContractEntity } from '@modules/power-system/contract/contract.entity';
import { PartyAService } from '@modules/power-system/party-a/party-a.service';
import { PartyBService } from '@modules/power-system/party-b/party-b.service';
import { QuotationQueryService } from '@modules/power-system/quotation/queries/quotation.query.service';
import {
  QuotationService,
  type CreateQuotationParams,
  type QuotationTransactionManager,
  type UpdateFixedPriceDetailsParams,
  type UpdatePriceDifferenceDetailsParams,
  type UpdateProportionSharingDetailsParams,
} from '@modules/power-system/quotation/quotation.service';
import type { QuotationView } from '@modules/power-system/quotation/quotation.types';
import {
  normalizeUpdateContractInput,
  type UpdateContractNormalizedInput,
  type UpdateQuotationNormalizedInput,
} from './update-contract.input.normalize';

export interface UpdateContractUsecaseParams {
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
  readonly manager?: ContractTransactionManager;
}

export interface UpdateContractUsecaseResult {
  readonly contract: ContractDetailView;
}

@Injectable()
export class UpdateContractUsecase {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractQueryService: ContractQueryService,
    private readonly partyAService: PartyAService,
    private readonly partyBService: PartyBService,
    private readonly quotationService: QuotationService,
    private readonly quotationQueryService: QuotationQueryService,
  ) {}

  async execute(params: UpdateContractUsecaseParams): Promise<UpdateContractUsecaseResult> {
    const run = async (
      manager: ContractTransactionManager,
    ): Promise<UpdateContractUsecaseResult> => {
      const input = normalizeUpdateContractInput(params);
      const existingContract = await this.contractService.findActiveContractById(
        input.contractId,
        manager,
      );

      if (!existingContract) {
        throw new DomainError(POWER_SYSTEM_ERROR.CONTRACT_NOT_FOUND, '合同不存在');
      }

      const updatePatch = await this.buildUpdateContractParams(input, existingContract, manager);
      const updated = await this.contractService.updateContract(
        {
          contractId: input.contractId,
          ...updatePatch,
          updatedBy: 'admin',
        },
        manager,
      );

      if (!updated) {
        throw new DomainError(POWER_SYSTEM_ERROR.CONTRACT_NOT_FOUND, '合同不存在');
      }

      if (input.quotation) {
        await this.updateQuotation(updated.contractId, input.quotation, manager);
      }

      const detail = await this.contractService.findActiveContractDetailByIdWithManager(
        updated.contractId,
        manager,
      );
      if (!detail) {
        throw new DomainError(POWER_SYSTEM_ERROR.CONTRACT_NOT_FOUND, '合同不存在');
      }

      return {
        contract: this.contractQueryService.toDetailView(
          detail,
          detail.quotation
            ? this.toContractQuotationInfo(this.quotationQueryService.toView(detail.quotation))
            : this.contractQueryService.buildEmptyQuotationInfo(),
        ),
      };
    };

    return params.manager
      ? await run(params.manager)
      : await this.contractService.runTransaction(async (manager) => await run(manager));
  }

  private async buildUpdateContractParams(
    input: UpdateContractNormalizedInput,
    existingContract: ContractEntity,
    manager: ContractTransactionManager,
  ): Promise<Omit<UpdateContractParams, 'contractId' | 'updatedBy'>> {
    type MutableContractPatch = {
      -readonly [Key in keyof Omit<UpdateContractParams, 'contractId' | 'updatedBy'>]?: Omit<
        UpdateContractParams,
        'contractId' | 'updatedBy'
      >[Key];
    };

    const customUpdateTriggered = this.hasCustomPartyAUpdate(input);
    const patch: MutableContractPatch = {
      ...pickIfDefined('contractCurrentStatus', input.contractCurrentStatus),
      ...pickIfDefined('workOrderNumber', input.workOrderNumber),
      ...pickIfDefined('confirmationMethod', input.confirmationMethod),
      ...pickIfDefined('partyAContractNo', input.partyAContractNo),
      ...pickIfDefined('partyBContractNo', input.partyBContractNo),
      ...pickIfDefined('submissionTime', input.submissionTime),
      ...pickIfDefined('confirmationTime', input.confirmationTime),
      ...pickIfDefined('contractSignDate', input.contractSignDate),
      ...pickIfDefined('partyASignDate', input.partyASignDate),
      ...pickIfDefined('partyBSignDate', input.partyBSignDate),
      ...pickIfDefined('orderTime', input.orderTime),
      ...pickIfDefined('signLocation', input.signLocation),
      ...pickIfDefined('additionalTerms', input.additionalTerms),
      ...pickIfDefined('disputeResolutionMethod', input.disputeResolutionMethod),
      ...pickIfDefined('filingMethod', input.filingMethod),
      ...pickIfDefined('filingParty', input.filingParty === null ? undefined : input.filingParty),
      ...pickIfDefined('partyBTerminationBefore30', input.partyBTerminationBefore30),
      ...pickIfDefined('partyBTerminationOther', input.partyBTerminationOther),
      ...pickIfDefined('partyBTerminationActive', input.partyBTerminationActive),
      ...pickIfDefined('partyATerminationBefore30', input.partyATerminationBefore30),
      ...pickIfDefined('partyATerminationIn30', input.partyATerminationIn30),
      ...pickIfDefined('partyATerminationActive', input.partyATerminationActive),
      ...pickIfDefined('originalCopies', input.originalCopies),
      ...pickIfDefined('duplicateCopies', input.duplicateCopies),
      ...pickIfDefined('partyBId', input.partyBId),
    };

    if (typeof input.partyBId !== 'undefined') {
      const partyB = await this.partyBService.findActivePartyBById(input.partyBId, manager);
      if (!partyB) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_B_NOT_FOUND, '乙方不存在');
      }
    }

    if (customUpdateTriggered) {
      const effectivePartyACustom = input.partyACustom ?? existingContract.partyACustom;

      if (effectivePartyACustom) {
        patch.partyAId = -1;
        if (typeof input.partyACustomCompany !== 'undefined') {
          patch.partyACustomCompany = input.partyACustomCompany;
        }
        if (typeof input.partyACustomCreditCode !== 'undefined') {
          patch.partyACustomCreditCode = input.partyACustomCreditCode;
        }
        if (typeof input.partyACustomLegalPerson !== 'undefined') {
          patch.partyACustomLegalPerson = input.partyACustomLegalPerson;
        }
        if (typeof input.partyACustomAddress !== 'undefined') {
          patch.partyACustomAddress = input.partyACustomAddress;
        }
        if (typeof input.partyACustomBank !== 'undefined') {
          patch.partyACustomBank = input.partyACustomBank;
        }
        if (typeof input.partyACustomBankAccount !== 'undefined') {
          patch.partyACustomBankAccount = input.partyACustomBankAccount;
        }
        if (typeof input.partyACustomContactPerson !== 'undefined') {
          patch.partyACustomContactPerson = input.partyACustomContactPerson;
        }
        if (typeof input.partyACustomContactPhone !== 'undefined') {
          patch.partyACustomContactPhone = input.partyACustomContactPhone;
        }
      } else {
        patch.partyACustomCompany =
          typeof input.partyACustomCompany === 'undefined' ? null : input.partyACustomCompany;
        patch.partyACustomCreditCode =
          typeof input.partyACustomCreditCode === 'undefined' ? null : input.partyACustomCreditCode;
        patch.partyACustomLegalPerson =
          typeof input.partyACustomLegalPerson === 'undefined'
            ? null
            : input.partyACustomLegalPerson;
        patch.partyACustomAddress =
          typeof input.partyACustomAddress === 'undefined' ? null : input.partyACustomAddress;
        patch.partyACustomBank =
          typeof input.partyACustomBank === 'undefined' ? null : input.partyACustomBank;
        patch.partyACustomBankAccount =
          typeof input.partyACustomBankAccount === 'undefined'
            ? null
            : input.partyACustomBankAccount;
        patch.partyACustomContactPerson =
          typeof input.partyACustomContactPerson === 'undefined'
            ? null
            : input.partyACustomContactPerson;
        patch.partyACustomContactPhone =
          typeof input.partyACustomContactPhone === 'undefined'
            ? null
            : input.partyACustomContactPhone;

        if (typeof input.partyAId !== 'undefined' && input.partyAId <= 0) {
          throw new DomainError(
            INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
            '当不使用自定义甲方信息时，甲方 ID 必须是大于 0 的整数',
          );
        }
      }
    }

    patch.partyACustom = input.partyACustom;
    if (typeof input.partyACustomCompany !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomCompany = input.partyACustomCompany;
    }
    if (typeof input.partyACustomCreditCode !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomCreditCode = input.partyACustomCreditCode;
    }
    if (typeof input.partyACustomLegalPerson !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomLegalPerson = input.partyACustomLegalPerson;
    }
    if (typeof input.partyACustomAddress !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomAddress = input.partyACustomAddress;
    }
    if (typeof input.partyACustomBank !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomBank = input.partyACustomBank;
    }
    if (typeof input.partyACustomBankAccount !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomBankAccount = input.partyACustomBankAccount;
    }
    if (typeof input.partyACustomContactPerson !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomContactPerson = input.partyACustomContactPerson;
    }
    if (typeof input.partyACustomContactPhone !== 'undefined' && !customUpdateTriggered) {
      patch.partyACustomContactPhone = input.partyACustomContactPhone;
    }

    if (
      typeof input.partyAId !== 'undefined' &&
      !(customUpdateTriggered && (input.partyACustom ?? existingContract.partyACustom))
    ) {
      patch.partyAId = input.partyAId;
      const partyA = await this.partyAService.findActivePartyAById(input.partyAId, manager);
      if (!partyA) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_A_NOT_FOUND, '甲方不存在');
      }
    }

    return patch;
  }

  private async updateQuotation(
    contractId: number,
    input: UpdateQuotationNormalizedInput,
    manager: QuotationTransactionManager,
  ): Promise<void> {
    const existingQuotation = await this.quotationService.findQuotationByContractId(
      contractId,
      manager,
    );

    if (!existingQuotation) {
      await this.createQuotationFromUpdate(contractId, input, manager);
      return;
    }

    const oldQuoteTypeId = this.ensureQuoteTypeId(existingQuotation.quoteTypeId);
    const targetQuoteTypeId = input.quoteTypeId ?? oldQuoteTypeId;

    await this.quotationService.updateQuotation(
      existingQuotation,
      {
        ...pickIfDefined('quoteTypeId', input.quoteTypeId),
        ...pickIfDefined('greenElecAllow', input.greenElecAllow),
        ...pickIfDefined('greenElecPrice', input.greenElecPrice),
        ...pickIfDefined('tradeStartTime', input.tradeStartTime),
        ...pickIfDefined('tradeEndTime', input.tradeEndTime),
        ...pickIfDefined('totalElectricity', input.totalElectricity),
        ...pickIfDefined('monthlyElectricity', input.monthlyElectricity),
        ...pickIfDefined('electricityDeviation', input.electricityDeviation),
        ...pickIfDefined('positiveDeviationRatio', input.positiveDeviationRatio),
        ...pickIfDefined('positiveDeviationPrice', input.positiveDeviationPrice),
        ...pickIfDefined('negativeDeviationRatio', input.negativeDeviationRatio),
        ...pickIfDefined('negativeDeviationPrice', input.negativeDeviationPrice),
        ...pickIfDefined('standardCurveMethod', input.standardCurveMethod),
        ...pickIfDefined('curveModifyDays', input.curveModifyDays),
        ...pickIfDefined('curveDeviation', input.curveDeviation),
        ...pickIfDefined('curvePositiveRatio', input.curvePositiveRatio),
        ...pickIfDefined('curvePositivePrice', input.curvePositivePrice),
        ...pickIfDefined('curveNegativeRatio', input.curveNegativeRatio),
        ...pickIfDefined('curveNegativePrice', input.curveNegativePrice),
        updatedBy: 'admin',
      },
      manager,
    );

    if (targetQuoteTypeId !== oldQuoteTypeId) {
      await this.quotationService.removeDetailsForQuoteType(
        existingQuotation.id,
        oldQuoteTypeId,
        manager,
      );
      await this.upsertQuotationDetails(
        targetQuoteTypeId,
        existingQuotation.id,
        input.quoteDetails ?? {},
        manager,
      );
      return;
    }

    if (input.quoteDetails) {
      await this.upsertQuotationDetails(
        targetQuoteTypeId,
        existingQuotation.id,
        input.quoteDetails,
        manager,
      );
    }
  }

  private async createQuotationFromUpdate(
    contractId: number,
    input: UpdateQuotationNormalizedInput,
    manager: QuotationTransactionManager,
  ): Promise<void> {
    if (
      typeof input.quoteTypeId === 'undefined' ||
      typeof input.tradeStartTime === 'undefined' ||
      typeof input.tradeEndTime === 'undefined' ||
      typeof input.totalElectricity === 'undefined' ||
      typeof input.monthlyElectricity === 'undefined'
    ) {
      throw new DomainError(
        INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
        '合同缺少可更新的报价记录时，报价信息必须提供完整创建字段',
      );
    }

    if (input.greenElecAllow === true && typeof input.greenElecPrice === 'undefined') {
      throw new DomainError(
        INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE,
        '当允许绿电时，绿电价格必须提供',
      );
    }

    const quotation = await this.quotationService.createQuotation(
      {
        contractId,
        quoteTypeId: input.quoteTypeId,
        greenElecAllow: input.greenElecAllow ?? true,
        greenElecPrice: input.greenElecPrice ?? null,
        tradeStartTime: input.tradeStartTime,
        tradeEndTime: input.tradeEndTime,
        totalElectricity: input.totalElectricity,
        monthlyElectricity: input.monthlyElectricity,
        electricityDeviation: input.electricityDeviation ?? null,
        positiveDeviationRatio: input.positiveDeviationRatio ?? null,
        positiveDeviationPrice: input.positiveDeviationPrice ?? null,
        negativeDeviationRatio: input.negativeDeviationRatio ?? null,
        negativeDeviationPrice: input.negativeDeviationPrice ?? null,
        standardCurveMethod: input.standardCurveMethod ?? false,
        curveModifyDays: input.curveModifyDays ?? null,
        curveDeviation: input.curveDeviation ?? null,
        curvePositiveRatio: input.curvePositiveRatio ?? null,
        curvePositivePrice: input.curvePositivePrice ?? null,
        curveNegativeRatio: input.curveNegativeRatio ?? null,
        curveNegativePrice: input.curveNegativePrice ?? null,
        createdBy: 'admin',
      } satisfies CreateQuotationParams,
      manager,
    );

    await this.upsertQuotationDetails(
      input.quoteTypeId,
      quotation.id,
      input.quoteDetails ?? {},
      manager,
    );
  }

  private async upsertQuotationDetails(
    quoteTypeId: 1 | 2 | 3,
    quotationId: number,
    quoteDetails: Partial<NonNullable<UpdateQuotationNormalizedInput['quoteDetails']>>,
    manager: QuotationTransactionManager,
  ): Promise<void> {
    if (quoteTypeId === 1) {
      await this.quotationService.upsertFixedPriceDetails(
        quotationId,
        {
          ...pickIfDefined('fixedPriceRatio', quoteDetails.fixedPriceRatio),
          ...pickIfDefined('marketTransactionPrice', quoteDetails.marketTransactionPrice),
          ...pickIfDefined('priceLimit', quoteDetails.priceLimit),
          updatedBy: 'admin',
        } satisfies UpdateFixedPriceDetailsParams,
        manager,
      );
      return;
    }

    if (quoteTypeId === 2) {
      await this.quotationService.upsertProportionSharingDetails(
        quotationId,
        {
          ...pickIfDefined('psPropSharingRatio', quoteDetails.psPropSharingRatio),
          ...pickIfDefined('psDistRefPrice', quoteDetails.psDistRefPrice),
          ...pickIfDefined('psLongTermTransRatio', quoteDetails.psLongTermTransRatio),
          ...pickIfDefined('psPartyAPropBelowLongTerm', quoteDetails.psPartyAPropBelowLongTerm),
          ...pickIfDefined('psPartyBPropBelowLongTerm', quoteDetails.psPartyBPropBelowLongTerm),
          ...pickIfDefined('psPartyAPropAboveLongTerm', quoteDetails.psPartyAPropAboveLongTerm),
          ...pickIfDefined('psPartyBPropAboveLongTerm', quoteDetails.psPartyBPropAboveLongTerm),
          ...pickIfDefined('psMonthlyBidRatio', quoteDetails.psMonthlyBidRatio),
          ...pickIfDefined('psPartyAPropBelowMonthlyBid', quoteDetails.psPartyAPropBelowMonthlyBid),
          ...pickIfDefined('psPartyBPropBelowMonthlyBid', quoteDetails.psPartyBPropBelowMonthlyBid),
          ...pickIfDefined('psPartyAPropAboveMonthlyBid', quoteDetails.psPartyAPropAboveMonthlyBid),
          ...pickIfDefined('psPartyBPropAboveMonthlyBid', quoteDetails.psPartyBPropAboveMonthlyBid),
          ...pickIfDefined('psAgentProcRatio', quoteDetails.psAgentProcRatio),
          ...pickIfDefined('psPartyAPropBelowAgentProc', quoteDetails.psPartyAPropBelowAgentProc),
          ...pickIfDefined('psPartyBPropBelowAgentProc', quoteDetails.psPartyBPropBelowAgentProc),
          ...pickIfDefined('psPartyAPropAboveAgentProc', quoteDetails.psPartyAPropAboveAgentProc),
          ...pickIfDefined('psPartyBPropAboveAgentProc', quoteDetails.psPartyBPropAboveAgentProc),
          ...pickIfDefined('psIntraMonthRatio', quoteDetails.psIntraMonthRatio),
          ...pickIfDefined('psPartyAPropBelowIntraMonth', quoteDetails.psPartyAPropBelowIntraMonth),
          ...pickIfDefined('psPartyBPropBelowIntraMonth', quoteDetails.psPartyBPropBelowIntraMonth),
          ...pickIfDefined('psPartyAPropAboveIntraMonth', quoteDetails.psPartyAPropAboveIntraMonth),
          ...pickIfDefined('psPartyBPropAboveIntraMonth', quoteDetails.psPartyBPropAboveIntraMonth),
          ...pickIfDefined('psLongTermTransLimit', quoteDetails.psLongTermTransLimit),
          ...pickIfDefined('psMonthlyBidLimit', quoteDetails.psMonthlyBidLimit),
          ...pickIfDefined('psAgentProcLimit', quoteDetails.psAgentProcLimit),
          ...pickIfDefined('psIntraMonthLimit', quoteDetails.psIntraMonthLimit),
          updatedBy: 'admin',
        } satisfies UpdateProportionSharingDetailsParams,
        manager,
      );
      return;
    }

    await this.quotationService.upsertPriceDifferenceDetails(
      quotationId,
      {
        ...pickIfDefined('pdPriceDiffFlucRatio', quoteDetails.pdPriceDiffFlucRatio),
        ...pickIfDefined('pdLongTermTransRatio', quoteDetails.pdLongTermTransRatio),
        ...pickIfDefined('pdLongTermTransAvgPrice', quoteDetails.pdLongTermTransAvgPrice),
        ...pickIfDefined('pdLongTermTransDirection', quoteDetails.pdLongTermTransDirection),
        ...pickIfDefined('pdMonthlyBidRatio', quoteDetails.pdMonthlyBidRatio),
        ...pickIfDefined('pdMonthlyBidClearPrice', quoteDetails.pdMonthlyBidClearPrice),
        ...pickIfDefined('pdMonthlyBidDirection', quoteDetails.pdMonthlyBidDirection),
        ...pickIfDefined('pdAgentProcRatio', quoteDetails.pdAgentProcRatio),
        ...pickIfDefined('pdAgentAvgPrice', quoteDetails.pdAgentAvgPrice),
        ...pickIfDefined('pdAgentDirection', quoteDetails.pdAgentDirection),
        ...pickIfDefined('pdIntraMonthRatio', quoteDetails.pdIntraMonthRatio),
        ...pickIfDefined('pdIntraMonthAvgPrice', quoteDetails.pdIntraMonthAvgPrice),
        ...pickIfDefined('pdIntraMonthDirection', quoteDetails.pdIntraMonthDirection),
        ...pickIfDefined('pdLongTermTransLimit', quoteDetails.pdLongTermTransLimit),
        ...pickIfDefined('pdMonthlyBidLimit', quoteDetails.pdMonthlyBidLimit),
        ...pickIfDefined('pdAgentProcLimit', quoteDetails.pdAgentProcLimit),
        ...pickIfDefined('pdIntraMonthLimit', quoteDetails.pdIntraMonthLimit),
        updatedBy: 'admin',
      } satisfies UpdatePriceDifferenceDetailsParams,
      manager,
    );
  }

  private hasCustomPartyAUpdate(input: UpdateContractNormalizedInput): boolean {
    return (
      typeof input.partyACustom !== 'undefined' ||
      typeof input.partyACustomCompany !== 'undefined' ||
      typeof input.partyACustomCreditCode !== 'undefined' ||
      typeof input.partyACustomLegalPerson !== 'undefined' ||
      typeof input.partyACustomAddress !== 'undefined' ||
      typeof input.partyACustomBank !== 'undefined' ||
      typeof input.partyACustomBankAccount !== 'undefined' ||
      typeof input.partyACustomContactPerson !== 'undefined' ||
      typeof input.partyACustomContactPhone !== 'undefined'
    );
  }

  private toContractQuotationInfo(quotationView: QuotationView): ContractQuotationInfoView {
    return {
      quoteTypeId: quotationView.quoteTypeId,
      quoteType: quotationView.quoteType,
      tradeStartTime: quotationView.tradeStartTime,
      tradeEndTime: quotationView.tradeEndTime,
      totalElectricity: quotationView.totalElectricity,
      monthlyElectricity: quotationView.monthlyElectricity,
      greenElecAllow: quotationView.greenElecAllow,
      greenElecPrice: quotationView.greenElecPrice,
      electricityDeviation: quotationView.electricityDeviation,
      positiveDeviationRatio: quotationView.positiveDeviationRatio,
      positiveDeviationPrice: quotationView.positiveDeviationPrice,
      negativeDeviationRatio: quotationView.negativeDeviationRatio,
      negativeDeviationPrice: quotationView.negativeDeviationPrice,
      standardCurveMethod: quotationView.standardCurveMethod,
      curveModifyDays: quotationView.curveModifyDays,
      curveDeviation: quotationView.curveDeviation,
      curvePositiveRatio: quotationView.curvePositiveRatio,
      curvePositivePrice: quotationView.curvePositivePrice,
      curveNegativeRatio: quotationView.curveNegativeRatio,
      curveNegativePrice: quotationView.curveNegativePrice,
      quoteDetails: quotationView.quoteDetails,
    };
  }

  private ensureQuoteTypeId(input: number): 1 | 2 | 3 {
    if (input === 1 || input === 2 || input === 3) {
      return input;
    }
    throw new DomainError(INPUT_NORMALIZE_ERROR.INVALID_ENUM_VALUE, '报价类型 ID 取值非法');
  }
}

function pickIfDefined<Key extends string, Value>(
  key: Key,
  value: Value | undefined,
): Partial<Record<Key, Value>> {
  if (typeof value === 'undefined') {
    return {};
  }
  return { [key]: value } as Partial<Record<Key, Value>>;
}
