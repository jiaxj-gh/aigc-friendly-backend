import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { PartyAEntity } from '../party-a/party-a.entity';
import { PowerSupplyEntity } from '../party-a/power-supply.entity';
import { PartyBEntity } from '../party-b/party-b.entity';
import { FixedPriceDetailsEntity } from '../quotation/fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from '../quotation/price-difference-details.entity';
import { ProportionSharingDetailsEntity } from '../quotation/proportion-sharing-details.entity';
import { QuotationEntity } from '../quotation/quotation.entity';
import { ContractEntity } from './contract.entity';
import type {
  ContractDetailRecord,
  ContractListFilters,
  ContractListRecord,
} from './contract.types';

export type ContractTransactionManager = EntityManager;

export interface CreateContractParams {
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
  readonly partyACustom: boolean;
  readonly partyACustomCompany: string | null;
  readonly partyACustomCreditCode: string | null;
  readonly partyACustomLegalPerson: string | null;
  readonly partyACustomAddress: string | null;
  readonly partyACustomBank: string | null;
  readonly partyACustomBankAccount: string | null;
  readonly partyACustomContactPerson: string | null;
  readonly partyACustomContactPhone: string | null;
  readonly partyAId: number;
  readonly partyBId: number;
  readonly createdBy: string;
}

export interface UpdateContractParams {
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
  readonly filingParty?: string;
  readonly partyBTerminationBefore30?: number | null;
  readonly partyBTerminationOther?: number | null;
  readonly partyBTerminationActive?: number | null;
  readonly partyATerminationBefore30?: number | null;
  readonly partyATerminationIn30?: number | null;
  readonly partyATerminationActive?: number | null;
  readonly originalCopies?: number;
  readonly duplicateCopies?: number;
  readonly partyACustom?: boolean;
  readonly partyACustomCompany?: string | null;
  readonly partyACustomCreditCode?: string | null;
  readonly partyACustomLegalPerson?: string | null;
  readonly partyACustomAddress?: string | null;
  readonly partyACustomBank?: string | null;
  readonly partyACustomBankAccount?: string | null;
  readonly partyACustomContactPerson?: string | null;
  readonly partyACustomContactPhone?: string | null;
  readonly partyAId?: number;
  readonly partyBId?: number;
  readonly updatedBy: string;
}

export interface ContractListResult {
  readonly items: ContractListRecord[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
    @InjectRepository(PartyAEntity)
    private readonly partyARepository: Repository<PartyAEntity>,
    @InjectRepository(PowerSupplyEntity)
    private readonly powerSupplyRepository: Repository<PowerSupplyEntity>,
    @InjectRepository(PartyBEntity)
    private readonly partyBRepository: Repository<PartyBEntity>,
    @InjectRepository(QuotationEntity)
    private readonly quotationRepository: Repository<QuotationEntity>,
    @InjectRepository(FixedPriceDetailsEntity)
    private readonly fixedPriceDetailsRepository: Repository<FixedPriceDetailsEntity>,
    @InjectRepository(ProportionSharingDetailsEntity)
    private readonly proportionSharingDetailsRepository: Repository<ProportionSharingDetailsEntity>,
    @InjectRepository(PriceDifferenceDetailsEntity)
    private readonly priceDifferenceDetailsRepository: Repository<PriceDifferenceDetailsEntity>,
  ) {}

  async listActiveContracts(filters: ContractListFilters): Promise<ContractListResult> {
    const where =
      filters.partyAId !== undefined
        ? { isActive: true, partyAId: filters.partyAId }
        : { isActive: true };

    const total = await this.contractRepository.count({ where });
    const totalPages = total > 0 ? Math.ceil(total / filters.pageSize) : 1;

    const contracts = await this.contractRepository.find({
      where,
      order: {
        updatedAt: 'DESC',
        contractId: 'DESC',
      },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    });

    if (contracts.length === 0) {
      return {
        items: [],
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      };
    }

    const partyAIds = [...new Set(contracts.map((item) => item.partyAId).filter((id) => id > 0))];
    const partyBIds = [...new Set(contracts.map((item) => item.partyBId))];
    const contractIds = contracts.map((item) => item.contractId);

    const [partyAs, partyBs, quotations] = await Promise.all([
      partyAIds.length > 0 ? this.partyARepository.findBy({ partyAId: In(partyAIds) }) : [],
      partyBIds.length > 0 ? this.partyBRepository.findBy({ partyBId: In(partyBIds) }) : [],
      contractIds.length > 0
        ? this.quotationRepository.find({
            where: { contractId: In(contractIds) },
            order: { id: 'ASC' },
          })
        : [],
    ]);

    const partyAMap = new Map(partyAs.map((item) => [item.partyAId, item]));
    const partyBMap = new Map(partyBs.map((item) => [item.partyBId, item]));
    const quotationMap = new Map<number, QuotationEntity>();
    for (const quotation of quotations) {
      if (!quotationMap.has(quotation.contractId)) {
        quotationMap.set(quotation.contractId, quotation);
      }
    }

    return {
      items: contracts.map((contract) => ({
        contract,
        partyA: contract.partyAId > 0 ? (partyAMap.get(contract.partyAId) ?? null) : null,
        partyB: partyBMap.get(contract.partyBId) ?? null,
        quotation: quotationMap.get(contract.contractId) ?? null,
      })),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
    };
  }

  async findActiveContractDetailById(contractId: number): Promise<ContractDetailRecord | null> {
    return await this.findActiveContractDetailByIdWithManager(contractId);
  }

  async findActiveContractById(
    contractId: number,
    manager?: ContractTransactionManager,
  ): Promise<ContractEntity | null> {
    return await this.getRepository(manager).findOne({
      where: {
        contractId,
        isActive: true,
      },
    });
  }

  async createContract(
    params: CreateContractParams,
    manager?: ContractTransactionManager,
  ): Promise<ContractEntity> {
    const repository = this.getRepository(manager);
    const entity = repository.create({
      contractCurrentStatus: params.contractCurrentStatus,
      isActive: true,
      workOrderNumber: params.workOrderNumber,
      confirmationMethod: params.confirmationMethod,
      partyAContractNo: params.partyAContractNo,
      partyBContractNo: params.partyBContractNo,
      submissionTime: params.submissionTime,
      confirmationTime: params.confirmationTime,
      contractSignDate: params.contractSignDate,
      partyASignDate: params.partyASignDate,
      partyBSignDate: params.partyBSignDate,
      orderTime: params.orderTime,
      signLocation: params.signLocation,
      additionalTerms: params.additionalTerms,
      disputeResolutionMethod: params.disputeResolutionMethod,
      filingMethod: params.filingMethod,
      filingParty: params.filingParty,
      partyBTerminationBefore30: params.partyBTerminationBefore30,
      partyBTerminationOther: params.partyBTerminationOther,
      partyBTerminationActive: params.partyBTerminationActive,
      partyATerminationBefore30: params.partyATerminationBefore30,
      partyATerminationIn30: params.partyATerminationIn30,
      partyATerminationActive: params.partyATerminationActive,
      originalCopies: params.originalCopies,
      duplicateCopies: params.duplicateCopies,
      partyACustom: params.partyACustom,
      partyACustomCompany: params.partyACustomCompany,
      partyACustomCreditCode: params.partyACustomCreditCode,
      partyACustomLegalPerson: params.partyACustomLegalPerson,
      partyACustomAddress: params.partyACustomAddress,
      partyACustomBank: params.partyACustomBank,
      partyACustomBankAccount: params.partyACustomBankAccount,
      partyACustomContactPerson: params.partyACustomContactPerson,
      partyACustomContactPhone: params.partyACustomContactPhone,
      partyAId: params.partyAId,
      partyBId: params.partyBId,
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
    });

    return await repository.save(entity);
  }

  async updateContract(
    params: UpdateContractParams,
    manager?: ContractTransactionManager,
  ): Promise<ContractEntity | null> {
    const entity = await this.findActiveContractById(params.contractId, manager);
    if (!entity) {
      return null;
    }

    if (typeof params.contractCurrentStatus !== 'undefined') {
      entity.contractCurrentStatus = params.contractCurrentStatus;
    }
    if (typeof params.workOrderNumber !== 'undefined') {
      entity.workOrderNumber = params.workOrderNumber;
    }
    if (typeof params.confirmationMethod !== 'undefined') {
      entity.confirmationMethod = params.confirmationMethod;
    }
    if (typeof params.partyAContractNo !== 'undefined') {
      entity.partyAContractNo = params.partyAContractNo;
    }
    if (typeof params.partyBContractNo !== 'undefined') {
      entity.partyBContractNo = params.partyBContractNo;
    }
    if (typeof params.submissionTime !== 'undefined') {
      entity.submissionTime = params.submissionTime;
    }
    if (typeof params.confirmationTime !== 'undefined') {
      entity.confirmationTime = params.confirmationTime;
    }
    if (typeof params.contractSignDate !== 'undefined') {
      entity.contractSignDate = params.contractSignDate;
    }
    if (typeof params.partyASignDate !== 'undefined') {
      entity.partyASignDate = params.partyASignDate;
    }
    if (typeof params.partyBSignDate !== 'undefined') {
      entity.partyBSignDate = params.partyBSignDate;
    }
    if (typeof params.orderTime !== 'undefined') {
      entity.orderTime = params.orderTime;
    }
    if (typeof params.signLocation !== 'undefined') {
      entity.signLocation = params.signLocation;
    }
    if (typeof params.additionalTerms !== 'undefined') {
      entity.additionalTerms = params.additionalTerms;
    }
    if (typeof params.disputeResolutionMethod !== 'undefined') {
      entity.disputeResolutionMethod = params.disputeResolutionMethod;
    }
    if (typeof params.filingMethod !== 'undefined') {
      entity.filingMethod = params.filingMethod;
    }
    if (typeof params.filingParty !== 'undefined') {
      entity.filingParty = params.filingParty;
    }
    if (typeof params.partyBTerminationBefore30 !== 'undefined') {
      entity.partyBTerminationBefore30 = params.partyBTerminationBefore30;
    }
    if (typeof params.partyBTerminationOther !== 'undefined') {
      entity.partyBTerminationOther = params.partyBTerminationOther;
    }
    if (typeof params.partyBTerminationActive !== 'undefined') {
      entity.partyBTerminationActive = params.partyBTerminationActive;
    }
    if (typeof params.partyATerminationBefore30 !== 'undefined') {
      entity.partyATerminationBefore30 = params.partyATerminationBefore30;
    }
    if (typeof params.partyATerminationIn30 !== 'undefined') {
      entity.partyATerminationIn30 = params.partyATerminationIn30;
    }
    if (typeof params.partyATerminationActive !== 'undefined') {
      entity.partyATerminationActive = params.partyATerminationActive;
    }
    if (typeof params.originalCopies !== 'undefined') {
      entity.originalCopies = params.originalCopies;
    }
    if (typeof params.duplicateCopies !== 'undefined') {
      entity.duplicateCopies = params.duplicateCopies;
    }
    if (typeof params.partyACustom !== 'undefined') {
      entity.partyACustom = params.partyACustom;
    }
    if (typeof params.partyACustomCompany !== 'undefined') {
      entity.partyACustomCompany = params.partyACustomCompany;
    }
    if (typeof params.partyACustomCreditCode !== 'undefined') {
      entity.partyACustomCreditCode = params.partyACustomCreditCode;
    }
    if (typeof params.partyACustomLegalPerson !== 'undefined') {
      entity.partyACustomLegalPerson = params.partyACustomLegalPerson;
    }
    if (typeof params.partyACustomAddress !== 'undefined') {
      entity.partyACustomAddress = params.partyACustomAddress;
    }
    if (typeof params.partyACustomBank !== 'undefined') {
      entity.partyACustomBank = params.partyACustomBank;
    }
    if (typeof params.partyACustomBankAccount !== 'undefined') {
      entity.partyACustomBankAccount = params.partyACustomBankAccount;
    }
    if (typeof params.partyACustomContactPerson !== 'undefined') {
      entity.partyACustomContactPerson = params.partyACustomContactPerson;
    }
    if (typeof params.partyACustomContactPhone !== 'undefined') {
      entity.partyACustomContactPhone = params.partyACustomContactPhone;
    }
    if (typeof params.partyAId !== 'undefined') {
      entity.partyAId = params.partyAId;
    }
    if (typeof params.partyBId !== 'undefined') {
      entity.partyBId = params.partyBId;
    }

    entity.updatedBy = params.updatedBy;
    entity.updatedAt = new Date();

    return await this.getRepository(manager).save(entity);
  }

  async softDeleteContract(
    params: {
      readonly contractId: number;
    },
    manager?: ContractTransactionManager,
  ): Promise<boolean> {
    const entity = await this.findActiveContractById(params.contractId, manager);
    if (!entity) {
      return false;
    }

    entity.isActive = false;
    entity.updatedAt = new Date();

    await this.getRepository(manager).save(entity);
    return true;
  }

  async runTransaction<T>(
    callback: (manager: ContractTransactionManager) => Promise<T>,
  ): Promise<T> {
    return await this.contractRepository.manager.transaction(callback);
  }

  getRepository(manager?: ContractTransactionManager): Repository<ContractEntity> {
    return manager ? manager.getRepository(ContractEntity) : this.contractRepository;
  }

  async findActiveContractDetailByIdWithManager(
    contractId: number,
    manager?: ContractTransactionManager,
  ): Promise<ContractDetailRecord | null> {
    const contract = await this.getRepository(manager).findOne({
      where: {
        contractId,
        isActive: true,
      },
    });

    if (!contract) {
      return null;
    }

    const [partyA, powerSupplyInfo, partyB, quotations] = await Promise.all([
      contract.partyAId > 0
        ? this.getPartyARepository(manager).findOne({
            where: {
              partyAId: contract.partyAId,
            },
          })
        : null,
      contract.partyAId > 0
        ? this.getPowerSupplyRepository(manager).find({
            where: {
              partyAId: contract.partyAId,
            },
            order: {
              psId: 'ASC',
            },
          })
        : [],
      this.getPartyBRepository(manager).findOne({
        where: {
          partyBId: contract.partyBId,
        },
      }),
      this.getQuotationRepository(manager).find({
        where: {
          contractId: contract.contractId,
        },
        order: {
          id: 'ASC',
        },
      }),
    ]);

    const quotation = quotations[0] ?? null;

    if (quotation) {
      const [fixedPriceDetails, proportionSharingDetails, priceDifferenceDetails] =
        await Promise.all([
          this.getFixedPriceDetailsRepository(manager).findOne({
            where: {
              quotationId: quotation.id,
            },
          }),
          this.getProportionSharingDetailsRepository(manager).findOne({
            where: {
              quotationId: quotation.id,
            },
          }),
          this.getPriceDifferenceDetailsRepository(manager).findOne({
            where: {
              quotationId: quotation.id,
            },
          }),
        ]);

      quotation.fixedPriceDetails = fixedPriceDetails;
      quotation.proportionSharingDetails = proportionSharingDetails;
      quotation.priceDifferenceDetails = priceDifferenceDetails;
    }

    return {
      contract,
      partyA,
      powerSupplyInfo,
      partyB,
      quotation,
    };
  }

  private getPartyARepository(manager?: ContractTransactionManager): Repository<PartyAEntity> {
    return manager ? manager.getRepository(PartyAEntity) : this.partyARepository;
  }

  private getPowerSupplyRepository(
    manager?: ContractTransactionManager,
  ): Repository<PowerSupplyEntity> {
    return manager ? manager.getRepository(PowerSupplyEntity) : this.powerSupplyRepository;
  }

  private getPartyBRepository(manager?: ContractTransactionManager): Repository<PartyBEntity> {
    return manager ? manager.getRepository(PartyBEntity) : this.partyBRepository;
  }

  private getQuotationRepository(
    manager?: ContractTransactionManager,
  ): Repository<QuotationEntity> {
    return manager ? manager.getRepository(QuotationEntity) : this.quotationRepository;
  }

  private getFixedPriceDetailsRepository(
    manager?: ContractTransactionManager,
  ): Repository<FixedPriceDetailsEntity> {
    return manager
      ? manager.getRepository(FixedPriceDetailsEntity)
      : this.fixedPriceDetailsRepository;
  }

  private getProportionSharingDetailsRepository(
    manager?: ContractTransactionManager,
  ): Repository<ProportionSharingDetailsEntity> {
    return manager
      ? manager.getRepository(ProportionSharingDetailsEntity)
      : this.proportionSharingDetailsRepository;
  }

  private getPriceDifferenceDetailsRepository(
    manager?: ContractTransactionManager,
  ): Repository<PriceDifferenceDetailsEntity> {
    return manager
      ? manager.getRepository(PriceDifferenceDetailsEntity)
      : this.priceDifferenceDetailsRepository;
  }
}
