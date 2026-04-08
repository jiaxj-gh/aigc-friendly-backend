import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { PartyAQueryService } from '@modules/power-system/party-a/queries/party-a.query.service';
import {
  PartyAService,
  type PartyATransactionManager,
} from '@modules/power-system/party-a/party-a.service';
import type { PartyAView } from '@modules/power-system/party-a/party-a.types';
import { normalizeUpdatePartyAInput } from './update-party-a.input.normalize';

export interface UpdatePartyAUsecaseParams {
  readonly partyAId?: unknown;
  readonly companyName?: unknown;
  readonly creditCode?: unknown;
  readonly companyAddress?: unknown;
  readonly legalPerson?: unknown;
  readonly depositoryBank?: unknown;
  readonly bankAccountNo?: unknown;
  readonly contactEmail?: unknown;
  readonly contactPerson?: unknown;
  readonly contactPhone?: unknown;
  readonly powerSupplyInfo?: unknown;
  readonly manager?: PartyATransactionManager;
}

export interface UpdatePartyAUsecaseResult {
  readonly partyA: PartyAView;
}

@Injectable()
export class UpdatePartyAUsecase {
  constructor(
    private readonly partyAService: PartyAService,
    private readonly partyAQueryService: PartyAQueryService,
  ) {}

  async execute(params: UpdatePartyAUsecaseParams): Promise<UpdatePartyAUsecaseResult> {
    const run = async (manager: PartyATransactionManager): Promise<UpdatePartyAUsecaseResult> => {
      const input = normalizeUpdatePartyAInput(params);
      const updated = await this.partyAService.updatePartyA(
        {
          partyAId: input.partyAId,
          companyName: input.companyName,
          creditCode: input.creditCode,
          companyAddress: input.companyAddress,
          legalPerson: input.legalPerson,
          depositoryBank: input.depositoryBank,
          bankAccountNo: input.bankAccountNo,
          contactEmail: input.contactEmail,
          contactPerson: input.contactPerson,
          contactPhone: input.contactPhone,
          updatedBy: 'admin',
        },
        manager,
      );

      if (!updated) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_A_NOT_FOUND, '甲方不存在');
      }

      if (typeof input.powerSupplyInfo !== 'undefined') {
        await this.partyAService.replacePowerSupplies(
          {
            partyAId: input.partyAId,
            items: input.powerSupplyInfo,
            createdBy: 'admin',
          },
          manager,
        );
      }

      const hydrated = await this.partyAService.findActivePartyAById(input.partyAId, manager);
      if (!hydrated) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_A_NOT_FOUND, '甲方不存在');
      }

      return {
        partyA: this.partyAQueryService.toView(hydrated),
      };
    };

    return params.manager
      ? await run(params.manager)
      : await this.partyAService.runTransaction(async (manager) => await run(manager));
  }
}
