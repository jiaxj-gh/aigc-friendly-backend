import { Injectable } from '@nestjs/common';
import {
  ContractDetailRecord,
  ContractDetailView,
  ContractListRecord,
  ContractListView,
  ContractPartyAView,
  ContractQuotationInfoView,
} from '../contract.types';

@Injectable()
export class ContractQueryService {
  toListView(record: ContractListRecord): ContractListView {
    const { contract } = record;
    const partyAView = this.toPartyAView(record);
    const partyBView = this.toPartyBView(record);
    const quotationView = this.toQuotationView(record);

    return {
      contractId: contract.contractId,
      partyAContractNo: contract.partyAContractNo,
      partyBContractNo: contract.partyBContractNo,
      contractCurrentStatus: contract.contractCurrentStatus,
      contractSignDate: contract.contractSignDate,
      ...partyAView,
      ...partyBView,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      isActive: contract.isActive,
      ...quotationView,
    };
  }

  private toPartyAView(
    record: ContractListRecord,
  ): Pick<ContractListView, 'partyACompanyName' | 'partyAContactPerson' | 'partyAContactPhone'> {
    return {
      partyACompanyName: this.resolvePartyACompanyName(record),
      partyAContactPerson: this.resolvePartyAContactPerson(record),
      partyAContactPhone: this.resolvePartyAContactPhone(record),
    };
  }

  private toPartyBView(
    record: ContractListRecord,
  ): Pick<ContractListView, 'partyBCompanyName' | 'partyBContactPerson' | 'partyBContactPhone'> {
    const { partyB } = record;
    return {
      partyBCompanyName: partyB?.companyName ?? null,
      partyBContactPerson: partyB?.contactPerson ?? null,
      partyBContactPhone: partyB?.contactPhone ?? null,
    };
  }

  private toQuotationView(
    record: ContractListRecord,
  ): Pick<
    ContractListView,
    | 'tradeStartTime'
    | 'tradeEndTime'
    | 'totalElectricity'
    | 'quoteType'
    | 'quoteTypeId'
    | 'greenElecAllow'
  > {
    const { quotation } = record;
    return {
      tradeStartTime: quotation?.tradeStartTime ?? null,
      tradeEndTime: quotation?.tradeEndTime ?? null,
      totalElectricity: quotation?.totalElectricity ?? null,
      quoteType: this.toQuoteTypeName(quotation?.quoteTypeId ?? null),
      quoteTypeId: quotation?.quoteTypeId ?? null,
      greenElecAllow: quotation?.greenElecAllow ?? null,
    };
  }

  private resolvePartyACompanyName(record: ContractListRecord): string | null {
    if (record.contract.partyACustom) {
      return record.contract.partyACustomCompany;
    }
    return record.partyA?.companyName ?? null;
  }

  private resolvePartyAContactPerson(record: ContractListRecord): string | null {
    if (record.contract.partyACustom) {
      return record.contract.partyACustomContactPerson;
    }
    return record.partyA?.contactPerson ?? null;
  }

  private resolvePartyAContactPhone(record: ContractListRecord): string | null {
    if (record.contract.partyACustom) {
      return record.contract.partyACustomContactPhone;
    }
    return record.partyA?.contactPhone ?? null;
  }

  private toQuoteTypeName(quoteTypeId: number | null): string | null {
    if (quoteTypeId === 1) {
      return '固定价格';
    }
    if (quoteTypeId === 2) {
      return '比例分成';
    }
    if (quoteTypeId === 3) {
      return '价差浮动';
    }
    return null;
  }

  toDetailView(
    record: ContractDetailRecord,
    quotationInfo: ContractQuotationInfoView,
  ): ContractDetailView {
    const { contract } = record;

    return {
      basicInfo: {
        contractId: contract.contractId,
        contractCurrentStatus: contract.contractCurrentStatus,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        createdBy: contract.createdBy,
        updatedBy: contract.updatedBy,
        isActive: contract.isActive,
      },
      contractContent: {
        workOrderNumber: contract.workOrderNumber,
        confirmationMethod: contract.confirmationMethod,
        partyAContractNo: contract.partyAContractNo,
        partyBContractNo: contract.partyBContractNo,
        submissionTime: contract.submissionTime,
        confirmationTime: contract.confirmationTime,
        contractSignDate: contract.contractSignDate,
        partyASignDate: contract.partyASignDate,
        partyBSignDate: contract.partyBSignDate,
        orderTime: contract.orderTime,
        signLocation: contract.signLocation,
        additionalTerms: contract.additionalTerms,
        disputeResolutionMethod: contract.disputeResolutionMethod,
        filingMethod: contract.filingMethod,
        filingParty: contract.filingParty,
        partyBTerminationBefore30: contract.partyBTerminationBefore30,
        partyBTerminationOther: contract.partyBTerminationOther,
        partyBTerminationActive: contract.partyBTerminationActive,
        partyATerminationBefore30: contract.partyATerminationBefore30,
        partyATerminationIn30: contract.partyATerminationIn30,
        partyATerminationActive: contract.partyATerminationActive,
        originalCopies: contract.originalCopies,
        duplicateCopies: contract.duplicateCopies,
        partyAId: contract.partyAId,
        partyACustom: contract.partyACustom,
        partyACustomCompany: contract.partyACustomCompany,
        partyACustomCreditCode: contract.partyACustomCreditCode,
        partyACustomLegalPerson: contract.partyACustomLegalPerson,
        partyACustomAddress: contract.partyACustomAddress,
        partyACustomBank: contract.partyACustomBank,
        partyACustomBankAccount: contract.partyACustomBankAccount,
        partyACustomContactPerson: contract.partyACustomContactPerson,
        partyACustomContactPhone: contract.partyACustomContactPhone,
        partyBId: contract.partyBId,
        partyA: this.toDetailPartyAView(record),
        partyB: record.partyB
          ? {
              partyBId: record.partyB.partyBId,
              configName: record.partyB.configName,
              companyName: record.partyB.companyName,
              creditCode: record.partyB.creditCode,
              companyAddress: record.partyB.companyAddress,
              legalPerson: record.partyB.legalPerson,
              contactPerson: record.partyB.contactPerson,
              contactPhone: record.partyB.contactPhone,
              contactEmail: record.partyB.contactEmail,
              depositoryBank: record.partyB.depositoryBank,
              bankAccountNo: record.partyB.bankAccountNo,
              hotLine: record.partyB.hotLine,
              isActive: record.partyB.isActive,
              isDefault: record.partyB.isDefault,
              createdAt: record.partyB.createdAt,
              updatedAt: record.partyB.updatedAt,
              createdBy: record.partyB.createdBy,
              updatedBy: record.partyB.updatedBy,
            }
          : null,
        quotationInfo,
      },
    };
  }

  private toDetailPartyAView(record: ContractDetailRecord): ContractPartyAView | null {
    const { contract, partyA, powerSupplyInfo } = record;

    if (contract.partyACustom) {
      return {
        partyAId: -1,
        companyName: contract.partyACustomCompany,
        creditCode: contract.partyACustomCreditCode,
        companyAddress: contract.partyACustomAddress,
        legalPerson: contract.partyACustomLegalPerson,
        depositoryBank: contract.partyACustomBank,
        bankAccountNo: contract.partyACustomBankAccount,
        contactEmail: null,
        contactPerson: contract.partyACustomContactPerson,
        contactPhone: contract.partyACustomContactPhone,
        powerSupplyInfo: [],
        isActive: true,
        createdAt: null,
        updatedAt: null,
        createdBy: 'custom',
        updatedBy: 'custom',
      };
    }

    if (!partyA) {
      return null;
    }

    return {
      partyAId: partyA.partyAId,
      companyName: partyA.companyName,
      creditCode: partyA.creditCode,
      companyAddress: partyA.companyAddress,
      legalPerson: partyA.legalPerson,
      depositoryBank: partyA.depositoryBank,
      bankAccountNo: partyA.bankAccountNo,
      contactEmail: partyA.contactEmail,
      contactPerson: partyA.contactPerson,
      contactPhone: partyA.contactPhone,
      powerSupplyInfo: powerSupplyInfo.map((item) => ({
        psId: item.psId,
        powerSupplyAddress: item.powerSupplyAddress,
        powerSupplyNumber: item.powerSupplyNumber,
      })),
      isActive: partyA.isActive,
      createdAt: partyA.createdAt,
      updatedAt: partyA.updatedAt,
      createdBy: partyA.createdBy,
      updatedBy: partyA.updatedBy,
    };
  }

  buildEmptyQuotationInfo(): ContractQuotationInfoView {
    return {
      quoteTypeId: null,
      quoteType: null,
      tradeStartTime: null,
      tradeEndTime: null,
      totalElectricity: null,
      monthlyElectricity: {},
      greenElecAllow: null,
      greenElecPrice: null,
      electricityDeviation: null,
      positiveDeviationRatio: null,
      positiveDeviationPrice: null,
      negativeDeviationRatio: null,
      negativeDeviationPrice: null,
      standardCurveMethod: null,
      curveModifyDays: null,
      curveDeviation: null,
      curvePositiveRatio: null,
      curvePositivePrice: null,
      curveNegativeRatio: null,
      curveNegativePrice: null,
      quoteDetails: {},
    };
  }
}
