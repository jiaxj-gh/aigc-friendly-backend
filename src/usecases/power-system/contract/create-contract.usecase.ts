import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { ContractQueryService } from '@modules/power-system/contract/queries/contract.query.service';
import {
  ContractService,
  type ContractTransactionManager,
} from '@modules/power-system/contract/contract.service';
import type {
  ContractDetailView,
  ContractQuotationInfoView,
} from '@modules/power-system/contract/contract.types';
import { PartyAService } from '@modules/power-system/party-a/party-a.service';
import { PartyBService } from '@modules/power-system/party-b/party-b.service';
import { QuotationQueryService } from '@modules/power-system/quotation/queries/quotation.query.service';
import {
  QuotationService,
  type CreateFixedPriceDetailsParams,
  type CreatePriceDifferenceDetailsParams,
  type CreateProportionSharingDetailsParams,
} from '@modules/power-system/quotation/quotation.service';
import type { QuotationView } from '@modules/power-system/quotation/quotation.types';
import {
  normalizeCreateContractInput,
  type CreateContractNormalizedInput,
} from './create-contract.input.normalize';

export interface CreateContractUsecaseParams {
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
  readonly manager?: ContractTransactionManager;
}

export interface CreateContractUsecaseResult {
  readonly contract: ContractDetailView;
}

@Injectable()
export class CreateContractUsecase {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractQueryService: ContractQueryService,
    private readonly partyAService: PartyAService,
    private readonly partyBService: PartyBService,
    private readonly quotationService: QuotationService,
    private readonly quotationQueryService: QuotationQueryService,
  ) {}

  async execute(params: CreateContractUsecaseParams): Promise<CreateContractUsecaseResult> {
    const run = async (
      manager: ContractTransactionManager,
    ): Promise<CreateContractUsecaseResult> => {
      const input = normalizeCreateContractInput(params);

      await this.ensureRelatedResources(input, manager);
      if (input.partyACustom) {
        await this.createShadowPartyA(input, manager);
      }

      const contract = await this.contractService.createContract(
        {
          contractCurrentStatus: input.contractCurrentStatus,
          workOrderNumber: input.workOrderNumber,
          confirmationMethod: input.confirmationMethod,
          partyAContractNo: input.partyAContractNo,
          partyBContractNo: input.partyBContractNo,
          submissionTime: input.submissionTime,
          confirmationTime: input.confirmationTime,
          contractSignDate: input.contractSignDate,
          partyASignDate: input.partyASignDate,
          partyBSignDate: input.partyBSignDate,
          orderTime: input.orderTime,
          signLocation: input.signLocation,
          additionalTerms: input.additionalTerms,
          disputeResolutionMethod: input.disputeResolutionMethod,
          filingMethod: input.filingMethod,
          filingParty: input.filingParty,
          partyBTerminationBefore30: input.partyBTerminationBefore30,
          partyBTerminationOther: input.partyBTerminationOther,
          partyBTerminationActive: input.partyBTerminationActive,
          partyATerminationBefore30: input.partyATerminationBefore30,
          partyATerminationIn30: input.partyATerminationIn30,
          partyATerminationActive: input.partyATerminationActive,
          originalCopies: input.originalCopies,
          duplicateCopies: input.duplicateCopies,
          partyACustom: input.partyACustom,
          partyACustomCompany: input.partyACustomCompany,
          partyACustomCreditCode: input.partyACustomCreditCode,
          partyACustomLegalPerson: input.partyACustomLegalPerson,
          partyACustomAddress: input.partyACustomAddress,
          partyACustomBank: input.partyACustomBank,
          partyACustomBankAccount: input.partyACustomBankAccount,
          partyACustomContactPerson: input.partyACustomContactPerson,
          partyACustomContactPhone: input.partyACustomContactPhone,
          partyAId: input.partyAId,
          partyBId: input.partyBId,
          createdBy: 'admin',
        },
        manager,
      );

      const quotation = await this.quotationService.createQuotation(
        {
          contractId: contract.contractId,
          quoteTypeId: input.quotation.quoteTypeId,
          greenElecAllow: input.quotation.greenElecAllow,
          greenElecPrice: input.quotation.greenElecPrice,
          tradeStartTime: input.quotation.tradeStartTime,
          tradeEndTime: input.quotation.tradeEndTime,
          totalElectricity: input.quotation.totalElectricity,
          monthlyElectricity: input.quotation.monthlyElectricity,
          electricityDeviation: input.quotation.electricityDeviation,
          positiveDeviationRatio: input.quotation.positiveDeviationRatio,
          positiveDeviationPrice: input.quotation.positiveDeviationPrice,
          negativeDeviationRatio: input.quotation.negativeDeviationRatio,
          negativeDeviationPrice: input.quotation.negativeDeviationPrice,
          standardCurveMethod: input.quotation.standardCurveMethod,
          curveModifyDays: input.quotation.curveModifyDays,
          curveDeviation: input.quotation.curveDeviation,
          curvePositiveRatio: input.quotation.curvePositiveRatio,
          curvePositivePrice: input.quotation.curvePositivePrice,
          curveNegativeRatio: input.quotation.curveNegativeRatio,
          curveNegativePrice: input.quotation.curveNegativePrice,
          createdBy: 'admin',
        },
        manager,
      );

      await this.createQuoteDetails(quotation.id, input, manager);

      const detail = await this.contractService.findActiveContractDetailByIdWithManager(
        contract.contractId,
        manager,
      );
      if (!detail) {
        throw new Error(
          `Contract ${String(contract.contractId)} created but could not be reloaded`,
        );
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

  private async ensureRelatedResources(
    input: CreateContractNormalizedInput,
    manager: ContractTransactionManager,
  ): Promise<void> {
    if (!input.partyACustom) {
      const partyA = await this.partyAService.findActivePartyAById(input.partyAId, manager);
      if (!partyA) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_A_NOT_FOUND, '甲方不存在');
      }
    }

    const partyB = await this.partyBService.findActivePartyBById(input.partyBId, manager);
    if (!partyB) {
      throw new DomainError(POWER_SYSTEM_ERROR.PARTY_B_NOT_FOUND, '乙方不存在');
    }
  }

  private async createShadowPartyA(
    input: CreateContractNormalizedInput,
    manager: ContractTransactionManager,
  ): Promise<void> {
    await this.partyAService.createPartyA(
      {
        companyName: input.partyACustomCompany ?? '',
        creditCode: input.partyACustomCreditCode,
        companyAddress: input.partyACustomAddress,
        legalPerson: input.partyACustomLegalPerson,
        depositoryBank: input.partyACustomBank,
        bankAccountNo: input.partyACustomBankAccount,
        contactEmail: null,
        contactPerson: input.partyACustomContactPerson,
        contactPhone: input.partyACustomContactPhone,
        createdBy: 'admin',
      },
      manager,
    );
  }

  private async createQuoteDetails(
    quotationId: number,
    input: CreateContractNormalizedInput,
    manager: ContractTransactionManager,
  ): Promise<void> {
    if (input.quotation.quoteTypeId === 1) {
      const params: CreateFixedPriceDetailsParams = {
        quotationId,
        fixedPriceRatio: input.quotation.quoteDetails.fixedPriceRatio,
        marketTransactionPrice: input.quotation.quoteDetails.marketTransactionPrice,
        priceLimit: input.quotation.quoteDetails.priceLimit,
        createdBy: 'admin',
      };
      await this.quotationService.createFixedPriceDetails(params, manager);
      return;
    }

    if (input.quotation.quoteTypeId === 2) {
      const params: CreateProportionSharingDetailsParams = {
        quotationId,
        psPropSharingRatio: input.quotation.quoteDetails.psPropSharingRatio,
        psDistRefPrice: input.quotation.quoteDetails.psDistRefPrice,
        psLongTermTransRatio: input.quotation.quoteDetails.psLongTermTransRatio,
        psPartyAPropBelowLongTerm: input.quotation.quoteDetails.psPartyAPropBelowLongTerm,
        psPartyBPropBelowLongTerm: input.quotation.quoteDetails.psPartyBPropBelowLongTerm,
        psPartyAPropAboveLongTerm: input.quotation.quoteDetails.psPartyAPropAboveLongTerm,
        psPartyBPropAboveLongTerm: input.quotation.quoteDetails.psPartyBPropAboveLongTerm,
        psMonthlyBidRatio: input.quotation.quoteDetails.psMonthlyBidRatio,
        psPartyAPropBelowMonthlyBid: input.quotation.quoteDetails.psPartyAPropBelowMonthlyBid,
        psPartyBPropBelowMonthlyBid: input.quotation.quoteDetails.psPartyBPropBelowMonthlyBid,
        psPartyAPropAboveMonthlyBid: input.quotation.quoteDetails.psPartyAPropAboveMonthlyBid,
        psPartyBPropAboveMonthlyBid: input.quotation.quoteDetails.psPartyBPropAboveMonthlyBid,
        psAgentProcRatio: input.quotation.quoteDetails.psAgentProcRatio,
        psPartyAPropBelowAgentProc: input.quotation.quoteDetails.psPartyAPropBelowAgentProc,
        psPartyBPropBelowAgentProc: input.quotation.quoteDetails.psPartyBPropBelowAgentProc,
        psPartyAPropAboveAgentProc: input.quotation.quoteDetails.psPartyAPropAboveAgentProc,
        psPartyBPropAboveAgentProc: input.quotation.quoteDetails.psPartyBPropAboveAgentProc,
        psIntraMonthRatio: input.quotation.quoteDetails.psIntraMonthRatio,
        psPartyAPropBelowIntraMonth: input.quotation.quoteDetails.psPartyAPropBelowIntraMonth,
        psPartyBPropBelowIntraMonth: input.quotation.quoteDetails.psPartyBPropBelowIntraMonth,
        psPartyAPropAboveIntraMonth: input.quotation.quoteDetails.psPartyAPropAboveIntraMonth,
        psPartyBPropAboveIntraMonth: input.quotation.quoteDetails.psPartyBPropAboveIntraMonth,
        psLongTermTransLimit: input.quotation.quoteDetails.psLongTermTransLimit,
        psMonthlyBidLimit: input.quotation.quoteDetails.psMonthlyBidLimit,
        psAgentProcLimit: input.quotation.quoteDetails.psAgentProcLimit,
        psIntraMonthLimit: input.quotation.quoteDetails.psIntraMonthLimit,
        createdBy: 'admin',
      };
      await this.quotationService.createProportionSharingDetails(params, manager);
      return;
    }

    const params: CreatePriceDifferenceDetailsParams = {
      quotationId,
      pdPriceDiffFlucRatio: input.quotation.quoteDetails.pdPriceDiffFlucRatio,
      pdLongTermTransRatio: input.quotation.quoteDetails.pdLongTermTransRatio,
      pdLongTermTransAvgPrice: input.quotation.quoteDetails.pdLongTermTransAvgPrice,
      pdLongTermTransDirection: input.quotation.quoteDetails.pdLongTermTransDirection,
      pdMonthlyBidRatio: input.quotation.quoteDetails.pdMonthlyBidRatio,
      pdMonthlyBidClearPrice: input.quotation.quoteDetails.pdMonthlyBidClearPrice,
      pdMonthlyBidDirection: input.quotation.quoteDetails.pdMonthlyBidDirection,
      pdAgentProcRatio: input.quotation.quoteDetails.pdAgentProcRatio,
      pdAgentAvgPrice: input.quotation.quoteDetails.pdAgentAvgPrice,
      pdAgentDirection: input.quotation.quoteDetails.pdAgentDirection,
      pdIntraMonthRatio: input.quotation.quoteDetails.pdIntraMonthRatio,
      pdIntraMonthAvgPrice: input.quotation.quoteDetails.pdIntraMonthAvgPrice,
      pdIntraMonthDirection: input.quotation.quoteDetails.pdIntraMonthDirection,
      pdLongTermTransLimit: input.quotation.quoteDetails.pdLongTermTransLimit,
      pdMonthlyBidLimit: input.quotation.quoteDetails.pdMonthlyBidLimit,
      pdAgentProcLimit: input.quotation.quoteDetails.pdAgentProcLimit,
      pdIntraMonthLimit: input.quotation.quoteDetails.pdIntraMonthLimit,
      createdBy: 'admin',
    };
    await this.quotationService.createPriceDifferenceDetails(params, manager);
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
}
