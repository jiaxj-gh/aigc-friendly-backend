import { Module } from '@nestjs/common';
import { BillDocxRenderer } from './bill-docx.renderer';
import { ContractDocxRenderer } from './contract-docx.renderer';

@Module({
  providers: [ContractDocxRenderer, BillDocxRenderer],
  exports: [ContractDocxRenderer, BillDocxRenderer],
})
export class DocxInfrastructureModule {}
