import type { PartyAEntity } from '../party-a/party-a.entity';
import type { PowerSupplyEntity } from '../party-a/power-supply.entity';
import type { PartyBEntity } from '../party-b/party-b.entity';
import type { QuotationEntity } from '../quotation/quotation.entity';
import type { ContractEntity } from './contract.entity';

export interface ContractListFilters {
  readonly partyAId?: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface ContractListRecord {
  readonly contract: ContractEntity;
  readonly partyA: PartyAEntity | null;
  readonly partyB: PartyBEntity | null;
  readonly quotation: QuotationEntity | null;
}

export interface ContractDetailRecord {
  readonly contract: ContractEntity;
  readonly partyA: PartyAEntity | null;
  readonly powerSupplyInfo: PowerSupplyEntity[];
  readonly partyB: PartyBEntity | null;
  readonly quotation: QuotationEntity | null;
}

export interface ContractListView {
  readonly contractId: number;
  readonly partyAContractNo: string;
  readonly partyBContractNo: string;
  readonly contractCurrentStatus: string;
  readonly contractSignDate: string | null;
  readonly partyACompanyName: string | null;
  readonly partyAContactPerson: string | null;
  readonly partyAContactPhone: string | null;
  readonly partyBCompanyName: string | null;
  readonly partyBContactPerson: string | null;
  readonly partyBContactPhone: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isActive: boolean;
  readonly tradeStartTime: string | null;
  readonly tradeEndTime: string | null;
  readonly totalElectricity: number | null;
  readonly quoteType: string | null;
  readonly quoteTypeId: number | null;
  readonly greenElecAllow: boolean | null;
}

export interface ContractBasicInfoView {
  readonly contractId: number;
  readonly contractCurrentStatus: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
  readonly isActive: boolean;
}

export interface ContractPowerSupplyView {
  readonly psId: number;
  readonly powerSupplyAddress: string;
  readonly powerSupplyNumber: string;
}

export interface ContractPartyAView {
  readonly partyAId: number;
  readonly companyName: string | null;
  readonly creditCode: string | null;
  readonly companyAddress: string | null;
  readonly legalPerson: string | null;
  readonly depositoryBank: string | null;
  readonly bankAccountNo: string | null;
  readonly contactEmail: string | null;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly powerSupplyInfo: ContractPowerSupplyView[];
  readonly isActive: boolean;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export interface ContractPartyBView {
  readonly partyBId: number;
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
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string | null;
  readonly updatedBy: string | null;
}

export interface ContractQuotationInfoView {
  readonly quoteTypeId: number | null;
  readonly quoteType: string | null;
  readonly tradeStartTime: string | null;
  readonly tradeEndTime: string | null;
  readonly totalElectricity: number | null;
  readonly monthlyElectricity: Record<string, number>;
  readonly greenElecAllow: boolean | null;
  readonly greenElecPrice: number | null;
  readonly electricityDeviation: number | null;
  readonly positiveDeviationRatio: number | null;
  readonly positiveDeviationPrice: number | null;
  readonly negativeDeviationRatio: number | null;
  readonly negativeDeviationPrice: number | null;
  readonly standardCurveMethod: boolean | null;
  readonly curveModifyDays: number | null;
  readonly curveDeviation: number | null;
  readonly curvePositiveRatio: number | null;
  readonly curvePositivePrice: number | null;
  readonly curveNegativeRatio: number | null;
  readonly curveNegativePrice: number | null;
  readonly quoteDetails: Record<string, boolean | number | null>;
}

export interface ContractContentView {
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
  readonly partyA: ContractPartyAView | null;
  readonly partyB: ContractPartyBView | null;
  readonly quotationInfo: ContractQuotationInfoView;
}

export interface ContractDetailView {
  readonly basicInfo: ContractBasicInfoView;
  readonly contractContent: ContractContentView;
}
