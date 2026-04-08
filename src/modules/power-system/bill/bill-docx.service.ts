import { Injectable } from '@nestjs/common';
import { BillDocxRenderer } from '@src/infrastructure/docx/bill-docx.renderer';
import type { BillDocxPayload } from './bill.types';

@Injectable()
export class BillDocxService {
  constructor(private readonly billDocxRenderer: BillDocxRenderer) {}

  async render(payload: BillDocxPayload): Promise<Buffer> {
    return await this.billDocxRenderer.render(payload);
  }
}
