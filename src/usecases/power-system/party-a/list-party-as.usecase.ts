import { Injectable } from '@nestjs/common';
import { PartyAQueryService } from '@modules/power-system/party-a/queries/party-a.query.service';
import { PartyAService } from '@modules/power-system/party-a/party-a.service';
import type { PartyAView } from '@modules/power-system/party-a/party-a.types';
import { normalizeListPartyAsInput } from './list-party-as.input.normalize';

export interface ListPartyAsUsecaseParams {
  readonly companyName?: string;
  readonly creditCode?: string;
}

export interface ListPartyAsUsecaseResult {
  readonly items: PartyAView[];
  readonly total: number;
}

@Injectable()
export class ListPartyAsUsecase {
  constructor(
    private readonly partyAService: PartyAService,
    private readonly partyAQueryService: PartyAQueryService,
  ) {}

  async execute(params: ListPartyAsUsecaseParams = {}): Promise<ListPartyAsUsecaseResult> {
    const filters = normalizeListPartyAsInput(params);
    const entities = await this.partyAService.listActivePartyAs(filters);

    return {
      items: entities.map((entity) => this.partyAQueryService.toView(entity)),
      total: entities.length,
    };
  }
}
