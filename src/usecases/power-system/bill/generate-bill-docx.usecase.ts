import { Injectable } from '@nestjs/common';
import { BillDocxService } from '@modules/power-system/bill/bill-docx.service';
import { normalizeGenerateBillDocxInput } from './generate-bill-docx.input.normalize';

export interface GenerateBillDocxUsecaseParams {
  readonly partyAName?: unknown;
  readonly quotaInfo?: unknown;
}

export interface GenerateBillDocxUsecaseResult {
  readonly fileName: string;
  readonly contentType: string;
  readonly contentLength: number;
  readonly buffer: Buffer;
}

@Injectable()
export class GenerateBillDocxUsecase {
  constructor(private readonly billDocxService: BillDocxService) {}

  async execute(params: GenerateBillDocxUsecaseParams): Promise<GenerateBillDocxUsecaseResult> {
    const input = normalizeGenerateBillDocxInput(params);
    const buffer = await this.billDocxService.render(input);
    const timestamp = this.formatTimestamp(new Date());
    const safePartyAName = input.partyAName.replace(/[\\/*?:"<>|]/g, '_');
    const fileName = `bill_${safePartyAName}_${timestamp}.docx`;

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
