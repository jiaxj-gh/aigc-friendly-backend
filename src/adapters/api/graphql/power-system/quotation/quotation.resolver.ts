import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { Public } from '@adapters/api/graphql/decorators/public.decorator';
import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  GetQuotationByContractTypeUsecase,
  type GetQuotationByContractTypeUsecaseResult,
} from '@usecases/power-system/quotation/get-quotation-by-contract-type.usecase';
import { QuotationByContractTypeInput } from './dto/quotation-by-contract-type.input';
import { QuotationType } from './dto/quotation.type';

@Resolver(() => QuotationType)
export class PowerSystemQuotationResolver {
  constructor(
    private readonly getQuotationByContractTypeUsecase: GetQuotationByContractTypeUsecase,
  ) {}

  @Public()
  @ValidateInput()
  @Query(() => QuotationType, {
    nullable: true,
    description: '根据合同 ID 和报价类型查询报价信息',
  })
  async quotationByContractType(
    @Args('input') input: QuotationByContractTypeInput,
  ): Promise<QuotationType | null> {
    const result = await this.getQuotationByContractTypeUsecase.execute({
      contractId: input.contractId,
      quoteTypeId: input.quoteTypeId,
    });

    if (!result) {
      return null;
    }

    return this.toQuotationType(result);
  }

  private toQuotationType(
    item: Exclude<GetQuotationByContractTypeUsecaseResult, null>,
  ): QuotationType {
    return {
      id: item.id,
      contractId: item.contractId,
      quoteTypeId: item.quoteTypeId,
      quoteType: item.quoteType,
      greenElecAllow: item.greenElecAllow,
      greenElecPrice: item.greenElecPrice,
      tradeStartTime: item.tradeStartTime,
      tradeEndTime: item.tradeEndTime,
      totalElectricity: item.totalElectricity,
      monthlyElectricity: item.monthlyElectricity,
      electricityDeviation: item.electricityDeviation,
      positiveDeviationRatio: item.positiveDeviationRatio,
      positiveDeviationPrice: item.positiveDeviationPrice,
      negativeDeviationRatio: item.negativeDeviationRatio,
      negativeDeviationPrice: item.negativeDeviationPrice,
      standardCurveMethod: item.standardCurveMethod,
      curveModifyDays: item.curveModifyDays,
      curveDeviation: item.curveDeviation,
      curvePositiveRatio: item.curvePositiveRatio,
      curvePositivePrice: item.curvePositivePrice,
      curveNegativeRatio: item.curveNegativeRatio,
      curveNegativePrice: item.curveNegativePrice,
      quoteDetails: item.quoteDetails,
    };
  }
}
