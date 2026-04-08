import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PartyBEntity } from './party-b.entity';
import type { PartyBListFilters } from './party-b.types';

export type PartyBTransactionManager = EntityManager;

export interface CreatePartyBParams {
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
  readonly createdBy: string;
}

export interface UpdatePartyBParams {
  readonly partyBId: number;
  readonly configName?: string;
  readonly companyName?: string;
  readonly creditCode?: string;
  readonly companyAddress?: string;
  readonly legalPerson?: string;
  readonly contactPerson?: string;
  readonly contactPhone?: string;
  readonly contactEmail?: string;
  readonly depositoryBank?: string;
  readonly bankAccountNo?: string;
  readonly hotLine?: string;
  readonly isDefault?: boolean;
  readonly updatedBy: string;
}

export interface DeletePartyBParams {
  readonly partyBId: number;
}

@Injectable()
export class PartyBService {
  constructor(
    @InjectRepository(PartyBEntity)
    private readonly partyBRepository: Repository<PartyBEntity>,
  ) {}

  async listActivePartyBs(filters: PartyBListFilters): Promise<PartyBEntity[]> {
    const qb = this.partyBRepository
      .createQueryBuilder('partyB')
      .where('partyB.isActive = :isActive', { isActive: true });

    if (filters.configName) {
      qb.andWhere('partyB.configName LIKE :configName', {
        configName: `%${filters.configName}%`,
      });
    }

    if (filters.companyName) {
      qb.andWhere('partyB.companyName LIKE :companyName', {
        companyName: `%${filters.companyName}%`,
      });
    }

    if (filters.isDefault !== undefined) {
      qb.andWhere('partyB.isDefault = :isDefault', {
        isDefault: filters.isDefault,
      });
    }

    return await qb
      .orderBy('partyB.updatedAt', 'DESC')
      .addOrderBy('partyB.partyBId', 'DESC')
      .getMany();
  }

  async findActivePartyBById(
    partyBId: number,
    manager?: PartyBTransactionManager,
  ): Promise<PartyBEntity | null> {
    return await this.getRepository(manager).findOne({
      where: {
        partyBId,
        isActive: true,
      },
    });
  }

  async createPartyB(
    params: CreatePartyBParams,
    manager?: PartyBTransactionManager,
  ): Promise<PartyBEntity> {
    const repository = this.getRepository(manager);
    const entity = repository.create({
      configName: params.configName,
      companyName: params.companyName,
      creditCode: params.creditCode,
      companyAddress: params.companyAddress,
      legalPerson: params.legalPerson,
      contactPerson: params.contactPerson,
      contactPhone: params.contactPhone,
      contactEmail: params.contactEmail,
      depositoryBank: params.depositoryBank,
      bankAccountNo: params.bankAccountNo,
      hotLine: params.hotLine,
      isDefault: params.isDefault,
      isActive: true,
      createdBy: params.createdBy,
      updatedBy: params.createdBy,
    });

    return await repository.save(entity);
  }

  async updatePartyB(
    params: UpdatePartyBParams,
    manager?: PartyBTransactionManager,
  ): Promise<PartyBEntity | null> {
    const entity = await this.findActivePartyBById(params.partyBId, manager);
    if (!entity) {
      return null;
    }

    if (typeof params.configName !== 'undefined') {
      entity.configName = params.configName;
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
    if (typeof params.contactPerson !== 'undefined') {
      entity.contactPerson = params.contactPerson;
    }
    if (typeof params.contactPhone !== 'undefined') {
      entity.contactPhone = params.contactPhone;
    }
    if (typeof params.contactEmail !== 'undefined') {
      entity.contactEmail = params.contactEmail;
    }
    if (typeof params.depositoryBank !== 'undefined') {
      entity.depositoryBank = params.depositoryBank;
    }
    if (typeof params.bankAccountNo !== 'undefined') {
      entity.bankAccountNo = params.bankAccountNo;
    }
    if (typeof params.hotLine !== 'undefined') {
      entity.hotLine = params.hotLine;
    }
    if (typeof params.isDefault !== 'undefined') {
      entity.isDefault = params.isDefault;
    }

    entity.updatedBy = params.updatedBy;
    entity.updatedAt = new Date();

    return await this.getRepository(manager).save(entity);
  }

  async softDeletePartyB(
    params: DeletePartyBParams,
    manager?: PartyBTransactionManager,
  ): Promise<boolean> {
    const entity = await this.findActivePartyBById(params.partyBId, manager);
    if (!entity) {
      return false;
    }

    entity.isActive = false;
    entity.updatedAt = new Date();

    await this.getRepository(manager).save(entity);
    return true;
  }

  async runTransaction<T>(callback: (manager: PartyBTransactionManager) => Promise<T>): Promise<T> {
    return await this.partyBRepository.manager.transaction(callback);
  }

  getRepository(manager?: PartyBTransactionManager): Repository<PartyBEntity> {
    return manager ? manager.getRepository(PartyBEntity) : this.partyBRepository;
  }
}
