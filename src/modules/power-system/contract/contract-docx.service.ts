import { Injectable } from '@nestjs/common';
import { ContractDocxRenderer } from '@src/infrastructure/docx/contract-docx.renderer';
import type { ContractDetailView } from './contract.types';

@Injectable()
export class ContractDocxService {
  constructor(private readonly contractDocxRenderer: ContractDocxRenderer) {}

  async render(detail: ContractDetailView): Promise<Buffer> {
    return await this.contractDocxRenderer.render(detail);
  }
}
