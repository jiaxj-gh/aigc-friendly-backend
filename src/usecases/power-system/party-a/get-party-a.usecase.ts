import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { PartyAQueryService } from '@modules/power-system/party-a/queries/party-a.query.service';
import { PartyAService } from '@modules/power-system/party-a/party-a.service';
import type { PartyAView } from '@modules/power-system/party-a/party-a.types';
import { normalizeGetPartyAInput } from './get-party-a.input.normalize';

export interface GetPartyAUsecaseParams {
  readonly partyAId?: unknown;
}

export type GetPartyAUsecaseResult = PartyAView;

@Injectable()
export class GetPartyAUsecase {
  constructor(
    private readonly partyAService: PartyAService,
    private readonly partyAQueryService: PartyAQueryService,
  ) {}

  async execute(params: GetPartyAUsecaseParams): Promise<GetPartyAUsecaseResult> {
    const input = normalizeGetPartyAInput(params);
    const entity = await this.partyAService.findActivePartyAById(input.partyAId);

    if (!entity) {
      throw new DomainError(POWER_SYSTEM_ERROR.PARTY_A_NOT_FOUND, '甲方不存在');
    }

    return this.partyAQueryService.toView(entity);
  }
}
