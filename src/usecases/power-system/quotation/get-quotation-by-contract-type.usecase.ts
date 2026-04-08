import { Injectable } from '@nestjs/common';
import { QuotationQueryService } from '@modules/power-system/quotation/queries/quotation.query.service';
import { QuotationService } from '@modules/power-system/quotation/quotation.service';
import type { QuotationView } from '@modules/power-system/quotation/quotation.types';
import { normalizeGetQuotationByContractTypeInput } from './get-quotation-by-contract-type.input.normalize';

export interface GetQuotationByContractTypeUsecaseParams {
  readonly contractId?: unknown;
  readonly quoteTypeId?: unknown;
}

export type GetQuotationByContractTypeUsecaseResult = QuotationView | null;

@Injectable()
export class GetQuotationByContractTypeUsecase {
  constructor(
    private readonly quotationService: QuotationService,
    private readonly quotationQueryService: QuotationQueryService,
  ) {}

  async execute(
    params: GetQuotationByContractTypeUsecaseParams,
  ): Promise<GetQuotationByContractTypeUsecaseResult> {
    const input = normalizeGetQuotationByContractTypeInput(params);
    const entity = await this.quotationService.findQuotationByContractAndType({
      contractId: input.contractId,
      quoteTypeId: input.quoteTypeId,
    });

    if (!entity) {
      return null;
    }

    return this.quotationQueryService.toView(entity);
  }
}
