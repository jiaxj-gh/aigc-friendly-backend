import { Injectable } from '@nestjs/common';
import { PartyAQueryService } from '@modules/power-system/party-a/queries/party-a.query.service';
import {
  PartyAService,
  type PartyATransactionManager,
} from '@modules/power-system/party-a/party-a.service';
import type { PartyAView } from '@modules/power-system/party-a/party-a.types';
import { normalizeCreatePartyAInput } from './create-party-a.input.normalize';

export interface CreatePartyAUsecaseParams {
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

export interface CreatePartyAUsecaseResult {
  readonly partyA: PartyAView;
}

@Injectable()
export class CreatePartyAUsecase {
  constructor(
    private readonly partyAService: PartyAService,
    private readonly partyAQueryService: PartyAQueryService,
  ) {}

  async execute(params: CreatePartyAUsecaseParams): Promise<CreatePartyAUsecaseResult> {
    const run = async (manager: PartyATransactionManager): Promise<CreatePartyAUsecaseResult> => {
      const input = normalizeCreatePartyAInput(params);
      const partyA = await this.partyAService.createPartyA(
        {
          companyName: input.companyName,
          creditCode: input.creditCode,
          companyAddress: input.companyAddress,
          legalPerson: input.legalPerson,
          depositoryBank: input.depositoryBank,
          bankAccountNo: input.bankAccountNo,
          contactEmail: input.contactEmail,
          contactPerson: input.contactPerson,
          contactPhone: input.contactPhone,
          createdBy: 'admin',
        },
        manager,
      );

      await this.partyAService.createPowerSupplies(
        {
          partyAId: partyA.partyAId,
          items: input.powerSupplyInfo,
          createdBy: 'admin',
        },
        manager,
      );

      const hydrated = await this.partyAService.findActivePartyAById(partyA.partyAId, manager);
      if (!hydrated) {
        throw new Error(`PartyA ${String(partyA.partyAId)} created but could not be reloaded`);
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
