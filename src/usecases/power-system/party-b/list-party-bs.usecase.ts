import { Injectable } from '@nestjs/common';
import { PartyBQueryService } from '@modules/power-system/party-b/queries/party-b.query.service';
import { PartyBService } from '@modules/power-system/party-b/party-b.service';
import type { PartyBView } from '@modules/power-system/party-b/party-b.types';
import { normalizeListPartyBsInput } from './list-party-bs.input.normalize';

export interface ListPartyBsUsecaseParams {
  readonly configName?: string;
  readonly companyName?: string;
  readonly isDefault?: boolean;
}

export interface ListPartyBsUsecaseResult {
  readonly items: PartyBView[];
  readonly total: number;
}

@Injectable()
export class ListPartyBsUsecase {
  constructor(
    private readonly partyBService: PartyBService,
    private readonly partyBQueryService: PartyBQueryService,
  ) {}

  async execute(params: ListPartyBsUsecaseParams = {}): Promise<ListPartyBsUsecaseResult> {
    const filters = normalizeListPartyBsInput(params);
    const entities = await this.partyBService.listActivePartyBs(filters);

    return {
      items: entities.map((entity) => this.partyBQueryService.toView(entity)),
      total: entities.length,
    };
  }
}
