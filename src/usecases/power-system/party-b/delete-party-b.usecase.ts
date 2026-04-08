import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import {
  PartyBService,
  type PartyBTransactionManager,
} from '@modules/power-system/party-b/party-b.service';
import { normalizeDeletePartyBInput } from './delete-party-b.input.normalize';

export interface DeletePartyBUsecaseParams {
  readonly partyBId?: unknown;
  readonly manager?: PartyBTransactionManager;
}

@Injectable()
export class DeletePartyBUsecase {
  constructor(private readonly partyBService: PartyBService) {}

  async execute(params: DeletePartyBUsecaseParams): Promise<boolean> {
    const run = async (manager: PartyBTransactionManager): Promise<boolean> => {
      const input = normalizeDeletePartyBInput(params);
      const deleted = await this.partyBService.softDeletePartyB(
        {
          partyBId: input.partyBId,
        },
        manager,
      );

      if (!deleted) {
        throw new DomainError(POWER_SYSTEM_ERROR.PARTY_B_NOT_FOUND, '乙方不存在');
      }

      return true;
    };

    return params.manager
      ? await run(params.manager)
      : await this.partyBService.runTransaction(async (manager) => await run(manager));
  }
}
