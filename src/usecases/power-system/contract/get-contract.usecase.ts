import { DomainError, POWER_SYSTEM_ERROR } from '@core/common/errors/domain-error';
import { Injectable } from '@nestjs/common';
import { ContractQueryService } from '@modules/power-system/contract/queries/contract.query.service';
import { ContractService } from '@modules/power-system/contract/contract.service';
import type {
  ContractDetailView,
  ContractQuotationInfoView,
} from '@modules/power-system/contract/contract.types';
import { QuotationQueryService } from '@modules/power-system/quotation/queries/quotation.query.service';
import type { QuotationView } from '@modules/power-system/quotation/quotation.types';
import { normalizeGetContractInput } from './get-contract.input.normalize';

export interface GetContractUsecaseParams {
  readonly contractId?: unknown;
}

export type GetContractUsecaseResult = ContractDetailView;

@Injectable()
export class GetContractUsecase {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractQueryService: ContractQueryService,
    private readonly quotationQueryService: QuotationQueryService,
  ) {}

  async execute(params: GetContractUsecaseParams): Promise<GetContractUsecaseResult> {
    const input = normalizeGetContractInput(params);
    const record = await this.contractService.findActiveContractDetailById(input.contractId);

    if (!record) {
      throw new DomainError(POWER_SYSTEM_ERROR.CONTRACT_NOT_FOUND, '合同不存在');
    }

    const quotationInfo = record.quotation
      ? this.toContractQuotationInfo(this.quotationQueryService.toView(record.quotation))
      : this.contractQueryService.buildEmptyQuotationInfo();

    return this.contractQueryService.toDetailView(record, quotationInfo);
  }

  private toContractQuotationInfo(quotationView: QuotationView): ContractQuotationInfoView {
    return {
      quoteTypeId: quotationView.quoteTypeId,
      quoteType: quotationView.quoteType,
      tradeStartTime: quotationView.tradeStartTime,
      tradeEndTime: quotationView.tradeEndTime,
      totalElectricity: quotationView.totalElectricity,
      monthlyElectricity: quotationView.monthlyElectricity,
      greenElecAllow: quotationView.greenElecAllow,
      greenElecPrice: quotationView.greenElecPrice,
      electricityDeviation: quotationView.electricityDeviation,
      positiveDeviationRatio: quotationView.positiveDeviationRatio,
      positiveDeviationPrice: quotationView.positiveDeviationPrice,
      negativeDeviationRatio: quotationView.negativeDeviationRatio,
      negativeDeviationPrice: quotationView.negativeDeviationPrice,
      standardCurveMethod: quotationView.standardCurveMethod,
      curveModifyDays: quotationView.curveModifyDays,
      curveDeviation: quotationView.curveDeviation,
      curvePositiveRatio: quotationView.curvePositiveRatio,
      curvePositivePrice: quotationView.curvePositivePrice,
      curveNegativeRatio: quotationView.curveNegativeRatio,
      curveNegativePrice: quotationView.curveNegativePrice,
      quoteDetails: quotationView.quoteDetails,
    };
  }
}
