import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { Public } from '@adapters/api/graphql/decorators/public.decorator';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateContractUsecase } from '@usecases/power-system/contract/create-contract.usecase';
import { DeleteContractUsecase } from '@usecases/power-system/contract/delete-contract.usecase';
import {
  GetContractUsecase,
  type GetContractUsecaseResult,
} from '@usecases/power-system/contract/get-contract.usecase';
import {
  ListContractsUsecase,
  type ListContractsUsecaseResult,
} from '@usecases/power-system/contract/list-contracts.usecase';
import { UpdateContractUsecase } from '@usecases/power-system/contract/update-contract.usecase';
import { ContractInput } from './dto/contract.input';
import { ContractListItemType } from './dto/contract-list-item.type';
import { ContractType } from './dto/contract.type';
import { CreateContractInput } from './dto/create-contract.input';
import { DeleteContractInput } from './dto/delete-contract.input';
import { ContractsInput } from './dto/contracts.input';
import { ContractsOutput } from './dto/contracts.output';
import { UpdateContractInput } from './dto/update-contract.input';

@Resolver(() => ContractType)
export class PowerSystemContractResolver {
  constructor(
    private readonly createContractUsecase: CreateContractUsecase,
    private readonly deleteContractUsecase: DeleteContractUsecase,
    private readonly listContractsUsecase: ListContractsUsecase,
    private readonly getContractUsecase: GetContractUsecase,
    private readonly updateContractUsecase: UpdateContractUsecase,
  ) {}

  @Public()
  @ValidateInput()
  @Mutation(() => ContractType, { description: '创建合同' })
  async createContract(@Args('input') input: CreateContractInput): Promise<ContractType> {
    const result = await this.createContractUsecase.execute({
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
      partyAId: input.partyAId,
      partyACustom: input.partyACustom,
      partyACustomCompany: input.partyACustomCompany,
      partyACustomCreditCode: input.partyACustomCreditCode,
      partyACustomLegalPerson: input.partyACustomLegalPerson,
      partyACustomAddress: input.partyACustomAddress,
      partyACustomBank: input.partyACustomBank,
      partyACustomBankAccount: input.partyACustomBankAccount,
      partyACustomContactPerson: input.partyACustomContactPerson,
      partyACustomContactPhone: input.partyACustomContactPhone,
      partyBId: input.partyBId,
      quotation: input.quotation,
    });

    return this.toContractType(result.contract);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => ContractType, { description: '更新合同' })
  async updateContract(@Args('input') input: UpdateContractInput): Promise<ContractType> {
    const result = await this.updateContractUsecase.execute({
      contractId: input.contractId,
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
      partyAId: input.partyAId,
      partyACustom: input.partyACustom,
      partyACustomCompany: input.partyACustomCompany,
      partyACustomCreditCode: input.partyACustomCreditCode,
      partyACustomLegalPerson: input.partyACustomLegalPerson,
      partyACustomAddress: input.partyACustomAddress,
      partyACustomBank: input.partyACustomBank,
      partyACustomBankAccount: input.partyACustomBankAccount,
      partyACustomContactPerson: input.partyACustomContactPerson,
      partyACustomContactPhone: input.partyACustomContactPhone,
      partyBId: input.partyBId,
      quotation: input.quotation,
    });

    return this.toContractType(result.contract);
  }

  @Public()
  @ValidateInput()
  @Mutation(() => Boolean, { description: '删除合同（软删除）' })
  async deleteContract(@Args('input') input: DeleteContractInput): Promise<boolean> {
    return await this.deleteContractUsecase.execute({
      contractId: input.contractId,
    });
  }

  @Public()
  @ValidateInput()
  @Query(() => ContractsOutput, { description: '查询合同列表' })
  async contracts(
    @Args('input', { nullable: true }) input?: ContractsInput,
  ): Promise<ContractsOutput> {
    const result = await this.listContractsUsecase.execute({
      partyAId: input?.partyAId,
      page: input?.page,
      pageSize: input?.pageSize,
    });

    return {
      items: result.items.map((item) => this.toContractListItem(item)),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    };
  }

  @Public()
  @ValidateInput()
  @Query(() => ContractType, { description: '查询单个合同详情' })
  async contract(@Args('input') input: ContractInput): Promise<ContractType> {
    const result = await this.getContractUsecase.execute({
      contractId: input.contractId,
    });

    return this.toContractType(result);
  }

  private toContractListItem(
    item: ListContractsUsecaseResult['items'][number],
  ): ContractListItemType {
    return {
      contractId: item.contractId,
      partyAContractNo: item.partyAContractNo,
      partyBContractNo: item.partyBContractNo,
      contractCurrentStatus: item.contractCurrentStatus,
      contractSignDate: item.contractSignDate,
      partyACompanyName: item.partyACompanyName,
      partyAContactPerson: item.partyAContactPerson,
      partyAContactPhone: item.partyAContactPhone,
      partyBCompanyName: item.partyBCompanyName,
      partyBContactPerson: item.partyBContactPerson,
      partyBContactPhone: item.partyBContactPhone,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      isActive: item.isActive,
      tradeStartTime: item.tradeStartTime,
      tradeEndTime: item.tradeEndTime,
      totalElectricity: item.totalElectricity,
      quoteType: item.quoteType,
      quoteTypeId: item.quoteTypeId,
      greenElecAllow: item.greenElecAllow,
    };
  }

  private toContractType(item: GetContractUsecaseResult): ContractType {
    return {
      basicInfo: this.toContractBasicInfo(item),
      contractContent: this.toContractContent(item),
    };
  }

  private toContractBasicInfo(item: GetContractUsecaseResult): ContractType['basicInfo'] {
    return {
      contractId: item.basicInfo.contractId,
      contractCurrentStatus: item.basicInfo.contractCurrentStatus,
      createdAt: item.basicInfo.createdAt,
      updatedAt: item.basicInfo.updatedAt,
      createdBy: item.basicInfo.createdBy,
      updatedBy: item.basicInfo.updatedBy,
      isActive: item.basicInfo.isActive,
    };
  }

  private toContractContent(item: GetContractUsecaseResult): ContractType['contractContent'] {
    return {
      workOrderNumber: item.contractContent.workOrderNumber,
      confirmationMethod: item.contractContent.confirmationMethod,
      partyAContractNo: item.contractContent.partyAContractNo,
      partyBContractNo: item.contractContent.partyBContractNo,
      submissionTime: item.contractContent.submissionTime,
      confirmationTime: item.contractContent.confirmationTime,
      contractSignDate: item.contractContent.contractSignDate,
      partyASignDate: item.contractContent.partyASignDate,
      partyBSignDate: item.contractContent.partyBSignDate,
      orderTime: item.contractContent.orderTime,
      signLocation: item.contractContent.signLocation,
      additionalTerms: item.contractContent.additionalTerms,
      disputeResolutionMethod: item.contractContent.disputeResolutionMethod,
      filingMethod: item.contractContent.filingMethod,
      filingParty: item.contractContent.filingParty,
      partyBTerminationBefore30: item.contractContent.partyBTerminationBefore30,
      partyBTerminationOther: item.contractContent.partyBTerminationOther,
      partyBTerminationActive: item.contractContent.partyBTerminationActive,
      partyATerminationBefore30: item.contractContent.partyATerminationBefore30,
      partyATerminationIn30: item.contractContent.partyATerminationIn30,
      partyATerminationActive: item.contractContent.partyATerminationActive,
      originalCopies: item.contractContent.originalCopies,
      duplicateCopies: item.contractContent.duplicateCopies,
      partyAId: item.contractContent.partyAId,
      partyACustom: item.contractContent.partyACustom,
      partyACustomCompany: item.contractContent.partyACustomCompany,
      partyACustomCreditCode: item.contractContent.partyACustomCreditCode,
      partyACustomLegalPerson: item.contractContent.partyACustomLegalPerson,
      partyACustomAddress: item.contractContent.partyACustomAddress,
      partyACustomBank: item.contractContent.partyACustomBank,
      partyACustomBankAccount: item.contractContent.partyACustomBankAccount,
      partyACustomContactPerson: item.contractContent.partyACustomContactPerson,
      partyACustomContactPhone: item.contractContent.partyACustomContactPhone,
      partyBId: item.contractContent.partyBId,
      partyA: this.toContractPartyA(item),
      partyB: this.toContractPartyB(item),
      quotationInfo: this.toContractQuotationInfo(item),
    };
  }

  private toContractPartyA(
    item: GetContractUsecaseResult,
  ): NonNullable<ContractType['contractContent']['partyA']> | null {
    if (!item.contractContent.partyA) {
      return null;
    }

    return {
      partyAId: item.contractContent.partyA.partyAId,
      companyName: item.contractContent.partyA.companyName,
      creditCode: item.contractContent.partyA.creditCode,
      companyAddress: item.contractContent.partyA.companyAddress,
      legalPerson: item.contractContent.partyA.legalPerson,
      depositoryBank: item.contractContent.partyA.depositoryBank,
      bankAccountNo: item.contractContent.partyA.bankAccountNo,
      contactEmail: item.contractContent.partyA.contactEmail,
      contactPerson: item.contractContent.partyA.contactPerson,
      contactPhone: item.contractContent.partyA.contactPhone,
      powerSupplyInfo: item.contractContent.partyA.powerSupplyInfo.map((powerSupply) => ({
        psId: powerSupply.psId,
        powerSupplyAddress: powerSupply.powerSupplyAddress,
        powerSupplyNumber: powerSupply.powerSupplyNumber,
      })),
      isActive: item.contractContent.partyA.isActive,
      createdAt: item.contractContent.partyA.createdAt,
      updatedAt: item.contractContent.partyA.updatedAt,
      createdBy: item.contractContent.partyA.createdBy,
      updatedBy: item.contractContent.partyA.updatedBy,
    };
  }

  private toContractPartyB(
    item: GetContractUsecaseResult,
  ): NonNullable<ContractType['contractContent']['partyB']> | null {
    if (!item.contractContent.partyB) {
      return null;
    }

    return {
      partyBId: item.contractContent.partyB.partyBId,
      configName: item.contractContent.partyB.configName,
      companyName: item.contractContent.partyB.companyName,
      creditCode: item.contractContent.partyB.creditCode,
      companyAddress: item.contractContent.partyB.companyAddress,
      legalPerson: item.contractContent.partyB.legalPerson,
      contactPerson: item.contractContent.partyB.contactPerson,
      contactPhone: item.contractContent.partyB.contactPhone,
      contactEmail: item.contractContent.partyB.contactEmail,
      depositoryBank: item.contractContent.partyB.depositoryBank,
      bankAccountNo: item.contractContent.partyB.bankAccountNo,
      hotLine: item.contractContent.partyB.hotLine,
      isDefault: item.contractContent.partyB.isDefault,
      isActive: item.contractContent.partyB.isActive,
      createdAt: item.contractContent.partyB.createdAt,
      updatedAt: item.contractContent.partyB.updatedAt,
      createdBy: item.contractContent.partyB.createdBy,
      updatedBy: item.contractContent.partyB.updatedBy,
    };
  }

  private toContractQuotationInfo(
    item: GetContractUsecaseResult,
  ): ContractType['contractContent']['quotationInfo'] {
    return {
      quoteTypeId: item.contractContent.quotationInfo.quoteTypeId,
      quoteType: item.contractContent.quotationInfo.quoteType,
      tradeStartTime: item.contractContent.quotationInfo.tradeStartTime,
      tradeEndTime: item.contractContent.quotationInfo.tradeEndTime,
      totalElectricity: item.contractContent.quotationInfo.totalElectricity,
      monthlyElectricity: item.contractContent.quotationInfo.monthlyElectricity,
      greenElecAllow: item.contractContent.quotationInfo.greenElecAllow,
      greenElecPrice: item.contractContent.quotationInfo.greenElecPrice,
      electricityDeviation: item.contractContent.quotationInfo.electricityDeviation,
      positiveDeviationRatio: item.contractContent.quotationInfo.positiveDeviationRatio,
      positiveDeviationPrice: item.contractContent.quotationInfo.positiveDeviationPrice,
      negativeDeviationRatio: item.contractContent.quotationInfo.negativeDeviationRatio,
      negativeDeviationPrice: item.contractContent.quotationInfo.negativeDeviationPrice,
      standardCurveMethod: item.contractContent.quotationInfo.standardCurveMethod,
      curveModifyDays: item.contractContent.quotationInfo.curveModifyDays,
      curveDeviation: item.contractContent.quotationInfo.curveDeviation,
      curvePositiveRatio: item.contractContent.quotationInfo.curvePositiveRatio,
      curvePositivePrice: item.contractContent.quotationInfo.curvePositivePrice,
      curveNegativeRatio: item.contractContent.quotationInfo.curveNegativeRatio,
      curveNegativePrice: item.contractContent.quotationInfo.curveNegativePrice,
      quoteDetails: item.contractContent.quotationInfo.quoteDetails,
    };
  }
}
