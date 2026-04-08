import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { PartyBQueryService } from '@modules/power-system/party-b/queries/party-b.query.service';
import { PartyBService } from '@modules/power-system/party-b/party-b.service';
import type { PartyBView } from '@modules/power-system/party-b/party-b.types';
import { normalizeGetPartyBInput } from './get-party-b.input.normalize';

export interface GetPartyBUsecaseParams {
  readonly partyBId?: unknown;
}

export type GetPartyBUsecaseResult = PartyBView;

@Injectable()
export class GetPartyBUsecase {
  constructor(
    private readonly partyBService: PartyBService,
    private readonly partyBQueryService: PartyBQueryService,
  ) {}

  async execute(params: GetPartyBUsecaseParams): Promise<GetPartyBUsecaseResult> {
    const input = normalizeGetPartyBInput(params);
    const entity = await this.partyBService.findActivePartyBById(input.partyBId);

    if (!entity) {
      throw new DomainError(POWER_SYSTEM_ERROR.PARTY_B_NOT_FOUND, '乙方不存在');
    }

    return this.partyBQueryService.toView(entity);
  }
}
