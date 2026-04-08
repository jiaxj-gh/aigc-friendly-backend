import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { PartyBQueryService } from '@modules/power-system/party-b/queries/party-b.query.service';
import {
  PartyBService,
  type PartyBTransactionManager,
} from '@modules/power-system/party-b/party-b.service';
import type { PartyBView } from '@modules/power-system/party-b/party-b.types';
import { normalizeUpdatePartyBInput } from './update-party-b.input.normalize';

export interface UpdatePartyBUsecaseParams {
  readonly partyBId?: unknown;
  readonly configName?: unknown;
  readonly companyName?: unknown;
  readonly creditCode?: unknown;
  readonly companyAddress?: unknown;
  readonly legalPerson?: unknown;
  readonly contactPerson?: unknown;
  readonly contactPhone?: unknown;
  readonly contactEmail?: unknown;
  readonly depositoryBank?: unknown;
  readonly bankAccountNo?: unknown;
  readonly hotLine?: unknown;
  readonly isDefault?: boolean;
  readonly manager?: PartyBTransactionManager;
}

export interface UpdatePartyBUsecaseResult {
  readonly partyB: PartyBView;
}

@Injectable()
export class UpdatePartyBUsecase {
  constructor(
    private readonly partyBService: PartyBService,
    private readonly partyBQueryService: PartyBQueryService,
  ) {}

  async execute(params: UpdatePartyBUsecaseParams): Promise<UpdatePartyBUsecaseResult> {
    const run = async (manager: PartyBTransactionManager): Promise<UpdatePartyBUsecaseResult> => {
      const input = normalizeUpdatePartyBInput(params);
      const entity = await this.partyBService.updatePartyB(
        {
          partyBId: input.partyBId,
          configName: input.configName,
          companyName: input.companyName,
          creditCode: input.creditCode,
          companyAddress: input.companyAddress,
          legalPerson: input.legalPerson,
          contactPerson: input.contactPerson,
          contactPhone: input.contactPhone,
          contactEmail: input.contactEmail,
          depositoryBank: input.depositoryBank,
          bankAccountNo: input.bankAccountNo,
          hotLine: input.hotLine,
          isDefault: input.isDefault,
          updatedBy: 'admin',
        },
        manager,
      );

      if (!entity) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_B_NOT_FOUND, '乙方不存在');
      }

      return {
        partyB: this.partyBQueryService.toView(entity),
      };
    };

    return params.manager
      ? await run(params.manager)
      : await this.partyBService.runTransaction(async (manager) => await run(manager));
  }
}
