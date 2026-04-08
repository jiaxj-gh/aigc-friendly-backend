import { Injectable } from '@nestjs/common';
import { PartyBEntity } from '../party-b.entity';
import type { PartyBView } from '../party-b.types';

@Injectable()
export class PartyBQueryService {
  toView(entity: PartyBEntity): PartyBView {
    return {
      partyBId: entity.partyBId,
      configName: entity.configName,
      companyName: entity.companyName,
      creditCode: entity.creditCode,
      companyAddress: entity.companyAddress,
      legalPerson: entity.legalPerson,
      contactPerson: entity.contactPerson,
      contactPhone: entity.contactPhone,
      contactEmail: entity.contactEmail,
      depositoryBank: entity.depositoryBank,
      bankAccountNo: entity.bankAccountNo,
      hotLine: entity.hotLine,
      isDefault: entity.isDefault,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
