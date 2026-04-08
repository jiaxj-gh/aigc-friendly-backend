import { Injectable } from '@nestjs/common';
import { ContractQueryService } from '@modules/power-system/contract/queries/contract.query.service';
import { ContractService } from '@modules/power-system/contract/contract.service';
import type { ContractListView } from '@modules/power-system/contract/contract.types';
import { normalizeListContractsInput } from './list-contracts.input.normalize';

export interface ListContractsUsecaseParams {
  readonly partyAId?: number;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ListContractsUsecaseResult {
  readonly items: ContractListView[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

@Injectable()
export class ListContractsUsecase {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractQueryService: ContractQueryService,
  ) {}

  async execute(params: ListContractsUsecaseParams = {}): Promise<ListContractsUsecaseResult> {
    const filters = normalizeListContractsInput(params);
    const result = await this.contractService.listActiveContracts(filters);

    return {
      items: result.items.map((item) => this.contractQueryService.toListView(item)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }
}
