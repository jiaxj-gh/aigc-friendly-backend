import { Injectable } from '@nestjs/common';
import { ContractDocxService } from '@modules/power-system/contract/contract-docx.service';
import { GetContractUsecase } from './get-contract.usecase';
import { normalizeGenerateContractDocxInput } from './generate-contract-docx.input.normalize';

export interface GenerateContractDocxUsecaseParams {
  readonly contractId?: unknown;
}

export interface GenerateContractDocxUsecaseResult {
  readonly fileName: string;
  readonly contentType: string;
  readonly contentLength: number;
  readonly buffer: Buffer;
}

@Injectable()
export class GenerateContractDocxUsecase {
  constructor(
    private readonly getContractUsecase: GetContractUsecase,
    private readonly contractDocxService: ContractDocxService,
  ) {}

  async execute(
    params: GenerateContractDocxUsecaseParams,
  ): Promise<GenerateContractDocxUsecaseResult> {
    const input = normalizeGenerateContractDocxInput(params);
    const contract = await this.getContractUsecase.execute({
      contractId: input.contractId,
    });
    const buffer = await this.contractDocxService.render(contract);
    const timestamp = this.formatTimestamp(new Date());
    const fileName = `contract_${input.contractId}_${timestamp}.docx`;

    return {
      fileName,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      contentLength: buffer.byteLength,
      buffer,
    };
  }

  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
}
