import { Injectable } from '@nestjs/common';
import { PartyAEntity } from '../party-a.entity';
import { PowerSupplyEntity } from '../power-supply.entity';
import type { PartyAView, PowerSupplyView } from '../party-a.types';

@Injectable()
export class PartyAQueryService {
  toView(entity: PartyAEntity): PartyAView {
    return {
      partyAId: entity.partyAId,
      companyName: entity.companyName,
      creditCode: entity.creditCode,
      companyAddress: entity.companyAddress,
      legalPerson: entity.legalPerson,
      depositoryBank: entity.depositoryBank,
      bankAccountNo: entity.bankAccountNo,
      contactEmail: entity.contactEmail,
      contactPerson: entity.contactPerson,
      contactPhone: entity.contactPhone,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      powerSupplyInfo: (entity.powerSupplyInfo ?? []).map((item) => this.toPowerSupplyView(item)),
    };
  }

  private toPowerSupplyView(entity: PowerSupplyEntity): PowerSupplyView {
    return {
      psId: entity.psId,
      partyAId: entity.partyAId,
      powerSupplyAddress: entity.powerSupplyAddress,
      powerSupplyNumber: entity.powerSupplyNumber,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
