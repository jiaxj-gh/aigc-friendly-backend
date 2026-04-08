import { Injectable } from '@nestjs/common';
import { PartyBQueryService } from '@modules/power-system/party-b/queries/party-b.query.service';
import {
  PartyBService,
  type PartyBTransactionManager,
} from '@modules/power-system/party-b/party-b.service';
import type { PartyBView } from '@modules/power-system/party-b/party-b.types';
import { normalizeCreatePartyBInput } from './create-party-b.input.normalize';

export interface CreatePartyBUsecaseParams {
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

export interface CreatePartyBUsecaseResult {
  readonly partyB: PartyBView;
}

@Injectable()
export class CreatePartyBUsecase {
  constructor(
    private readonly partyBService: PartyBService,
    private readonly partyBQueryService: PartyBQueryService,
  ) {}

  async execute(params: CreatePartyBUsecaseParams): Promise<CreatePartyBUsecaseResult> {
    const run = async (manager: PartyBTransactionManager): Promise<CreatePartyBUsecaseResult> => {
      const input = normalizeCreatePartyBInput(params);
      const entity = await this.partyBService.createPartyB(
        {
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
          createdBy: 'admin',
        },
        manager,
      );

      return {
        partyB: this.partyBQueryService.toView(entity),
      };
    };

    return params.manager
      ? await run(params.manager)
      : await this.partyBService.runTransaction(async (manager) => await run(manager));
  }
}
