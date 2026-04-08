import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import {
  PartyAService,
  type PartyATransactionManager,
} from '@modules/power-system/party-a/party-a.service';
import { normalizeDeletePartyAInput } from './delete-party-a.input.normalize';

export interface DeletePartyAUsecaseParams {
  readonly partyAId?: unknown;
  readonly manager?: PartyATransactionManager;
}

@Injectable()
export class DeletePartyAUsecase {
  constructor(private readonly partyAService: PartyAService) {}

  async execute(params: DeletePartyAUsecaseParams): Promise<boolean> {
    const run = async (manager: PartyATransactionManager): Promise<boolean> => {
      const input = normalizeDeletePartyAInput(params);
      const deleted = await this.partyAService.softDeletePartyA(
        {
          partyAId: input.partyAId,
        },
        manager,
      );

      if (!deleted) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_A_NOT_FOUND, '甲方不存在');
      }

      return true;
    };

    return params.manager
      ? await run(params.manager)
      : await this.partyAService.runTransaction(async (manager) => await run(manager));
  }
}
