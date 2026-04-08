import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import {
  ContractService,
  type ContractTransactionManager,
} from '@modules/power-system/contract/contract.service';
import { normalizeDeleteContractInput } from './delete-contract.input.normalize';

export interface DeleteContractUsecaseParams {
  readonly contractId?: unknown;
  readonly manager?: ContractTransactionManager;
}

@Injectable()
export class DeleteContractUsecase {
  constructor(private readonly contractService: ContractService) {}

  async execute(params: DeleteContractUsecaseParams): Promise<boolean> {
    const run = async (manager: ContractTransactionManager): Promise<boolean> => {
      const input = normalizeDeleteContractInput(params);
      const deleted = await this.contractService.softDeleteContract(
        {
          contractId: input.contractId,
        },
        manager,
      );

      if (!deleted) {
        throw new DomainError(POWER_SYSTEM_ERROR.CONTRACT_NOT_FOUND, '合同不存在');
      }

      return true;
    };

    return params.manager
      ? await run(params.manager)
      : await this.contractService.runTransaction(async (manager) => await run(manager));
  }
}
