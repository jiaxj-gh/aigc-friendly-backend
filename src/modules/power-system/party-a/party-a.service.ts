import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PartyAEntity } from './party-a.entity';
import { PowerSupplyEntity } from './power-supply.entity';
import type { PartyAListFilters } from './party-a.types';

export type PartyATransactionManager = EntityManager;

export interface CreatePartyAParams {
  readonly companyName: string;
  readonly creditCode: string | null;
  readonly companyAddress: string | null;
  readonly legalPerson: string | null;
  readonly depositoryBank: string | null;
  readonly bankAccountNo: string | null;
  readonly contactEmail: string | null;
  readonly contactPerson: string | null;
  readonly contactPhone: string | null;
  readonly createdBy: string;
}

export interface CreatePowerSuppliesParams {
  readonly partyAId: number;
  readonly items: ReadonlyArray<{
    readonly powerSupplyAddress: string;
    readonly powerSupplyNumber: string;
  }>;
  readonly createdBy: string;
}

export interface UpdatePartyAParams {
  readonly partyAId: number;
  readonly companyName?: string;
  readonly creditCode?: string | null;
  readonly companyAddress?: string | null;
  readonly legalPerson?: string | null;
  readonly depositoryBank?: string | null;
  readonly bankAccountNo?: string | null;
  readonly contactEmail?: string | null;
  readonly contactPerson?: string | null;
  readonly contactPhone?: string | null;
  readonly updatedBy: string;
}

export interface DeletePartyAParams {
  readonly partyAId: number;
}

@Injectable()
export class PartyAService {
  constructor(
    @InjectRepository(PartyAEntity)
    private readonly partyARepository: Repository<PartyAEntity>,
    @InjectRepository(PowerSupplyEntity)
    private readonly powerSupplyRepository: Repository<PowerSupplyEntity>,
  ) {}

  async listActivePartyAs(filters: PartyAListFilters): Promise<PartyAEntity[]> {
    const qb = this.partyARepository
      .createQueryBuilder('partyA')
      .leftJoinAndSelect('partyA.powerSupplyInfo', 'powerSupply')
      .where('partyA.isActive = :isActive', { isActive: true });

    if (filters.companyName) {
      qb.andWhere('partyA.companyName LIKE :companyName', {
        companyName: `%${filters.companyName}%`,
      });
    }

    if (filters.creditCode) {
      qb.andWhere('partyA.creditCode = :creditCode', {
        creditCode: filters.creditCode,
      });
    }

    return await qb
      .orderBy('partyA.updatedAt', 'DESC')
      .addOrderBy('partyA.partyAId', 'DESC')
      .addOrderBy('powerSupply.psId', 'ASC')
      .getMany();
  }

  async findActivePartyAById(
    partyAId: number,
    manager?: PartyATransactionManager,
  ): Promise<PartyAEntity | null> {
    return await this.getPartyARepository(manager)
      .createQueryBuilder('partyA')
      .leftJoinAndSelect('partyA.powerSupplyInfo', 'powerSupply')
      .where('partyA.partyAId = :partyAId', { partyAId })
      .andWhere('partyA.isActive = :isActive', { isActive: true })
      .orderBy('powerSupply.psId', 'ASC')
      .getOne();
  }

  async createPartyA(
    params: CreatePartyAParams,
    manager?: PartyATransactionManager,
  ): Promise<PartyAEntity> {
    const repository = this.getPartyARepository(manager);
    const entity = repository.create({
      companyName: params.companyName,
      creditCode: params.creditCode,
      companyAddress: params.companyAddress,
      legalPerson: params.legalPerson,
      depositoryBank: params.depositoryBank,
      bankAccountNo: params.bankAccountNo,
      contactEmail: params.contactEmail,
      contactPerson: params.contactPerson,
      contactPhone: params.contactPhone,
      isActive: true,
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
    });

    return await repository.save(entity);
  }

  async createPowerSupplies(
    params: CreatePowerSuppliesParams,
    manager?: PartyATransactionManager,
  ): Promise<PowerSupplyEntity[]> {
    if (params.items.length === 0) {
      return [];
    }

    const repository = this.getPowerSupplyRepository(manager);
    const entities = params.items.map((item) =>
      repository.create({
        partyAId: params.partyAId,
        powerSupplyAddress: item.powerSupplyAddress,
        powerSupplyNumber: item.powerSupplyNumber,
        createdBy: params.createdBy,
        updatedBy: params.createdBy,
      }),
    );

    return await repository.save(entities);
  }

  async updatePartyA(
    params: UpdatePartyAParams,
    manager?: PartyATransactionManager,
  ): Promise<PartyAEntity | null> {
    const entity = await this.findActivePartyAById(params.partyAId, manager);
    if (!entity) {
      return null;
    }

    if (typeof params.companyName !== 'undefined') {
      entity.companyName = params.companyName;
    }
    if (typeof params.creditCode !== 'undefined') {
      entity.creditCode = params.creditCode;
    }
    if (typeof params.companyAddress !== 'undefined') {
      entity.companyAddress = params.companyAddress;
    }
    if (typeof params.legalPerson !== 'undefined') {
      entity.legalPerson = params.legalPerson;
    }
    if (typeof params.depositoryBank !== 'undefined') {
      entity.depositoryBank = params.depositoryBank;
    }
    if (typeof params.bankAccountNo !== 'undefined') {
      entity.bankAccountNo = params.bankAccountNo;
    }
    if (typeof params.contactEmail !== 'undefined') {
      entity.contactEmail = params.contactEmail;
    }
    if (typeof params.contactPerson !== 'undefined') {
      entity.contactPerson = params.contactPerson;
    }
    if (typeof params.contactPhone !== 'undefined') {
      entity.contactPhone = params.contactPhone;
    }

    entity.updatedBy = params.updatedBy;
    entity.updatedAt = new Date();

    return await this.getPartyARepository(manager).save(entity);
  }

  async replacePowerSupplies(
    params: CreatePowerSuppliesParams,
    manager?: PartyATransactionManager,
  ): Promise<PowerSupplyEntity[]> {
    await this.getPowerSupplyRepository(manager)
      .createQueryBuilder()
      .delete()
      .where('party_a_id = :partyAId', { partyAId: params.partyAId })
      .execute();

    return await this.createPowerSupplies(params, manager);
  }

  async softDeletePartyA(
    params: DeletePartyAParams,
    manager?: PartyATransactionManager,
  ): Promise<boolean> {
    const entity = await this.findActivePartyAById(params.partyAId, manager);
    if (!entity) {
      return false;
    }

    entity.isActive = false;
    entity.updatedAt = new Date();

    await this.getPartyARepository(manager).save(entity);
    return true;
  }

  async runTransaction<T>(callback: (manager: PartyATransactionManager) => Promise<T>): Promise<T> {
    return await this.partyARepository.manager.transaction(callback);
  }

  getPartyARepository(manager?: PartyATransactionManager): Repository<PartyAEntity> {
    return manager ? manager.getRepository(PartyAEntity) : this.partyARepository;
  }

  getPowerSupplyRepository(manager?: PartyATransactionManager): Repository<PowerSupplyEntity> {
    return manager ? manager.getRepository(PowerSupplyEntity) : this.powerSupplyRepository;
  }
}
