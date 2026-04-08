import { Injectable } from '@nestjs/common';
import { FixedPriceDetailsEntity } from '../fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from '../price-difference-details.entity';
import { QuotationEntity } from '../quotation.entity';
import type { QuotationView } from '../quotation.types';
import { ProportionSharingDetailsEntity } from '../proportion-sharing-details.entity';

@Injectable()
export class QuotationQueryService {
  toView(entity: QuotationEntity): QuotationView {
    return {
      id: entity.id,
      contractId: entity.contractId,
      quoteTypeId: entity.quoteTypeId,
      quoteType: this.toQuoteTypeName(entity.quoteTypeId),
      greenElecAllow: entity.greenElecAllow,
      greenElecPrice: entity.greenElecPrice,
      tradeStartTime: entity.tradeStartTime,
      tradeEndTime: entity.tradeEndTime,
      totalElectricity: entity.totalElectricity,
      monthlyElectricity: entity.monthlyElectricity ?? {},
      electricityDeviation: entity.electricityDeviation,
      positiveDeviationRatio: entity.positiveDeviationRatio,
      positiveDeviationPrice: entity.positiveDeviationPrice,
      negativeDeviationRatio: entity.negativeDeviationRatio,
      negativeDeviationPrice: entity.negativeDeviationPrice,
      standardCurveMethod: entity.standardCurveMethod,
      curveModifyDays: entity.curveModifyDays,
      curveDeviation: entity.curveDeviation,
      curvePositiveRatio: entity.curvePositiveRatio,
      curvePositivePrice: entity.curvePositivePrice,
      curveNegativeRatio: entity.curveNegativeRatio,
      curveNegativePrice: entity.curveNegativePrice,
      quoteDetails: this.toQuoteDetails(entity),
    };
  }

  private toQuoteDetails(entity: QuotationEntity): Record<string, boolean | number | null> {
    if (entity.quoteTypeId === 1 && entity.fixedPriceDetails) {
      return this.toFixedPriceDetails(entity.fixedPriceDetails);
    }
    if (entity.quoteTypeId === 2 && entity.proportionSharingDetails) {
      return this.toProportionSharingDetails(entity.proportionSharingDetails);
    }
    if (entity.quoteTypeId === 3 && entity.priceDifferenceDetails) {
      return this.toPriceDifferenceDetails(entity.priceDifferenceDetails);
    }
    return {};
  }

  private toQuoteTypeName(quoteTypeId: number): string {
    if (quoteTypeId === 1) {
      return '固定价格';
    }
    if (quoteTypeId === 2) {
      return '比例分成';
    }
    if (quoteTypeId === 3) {
      return '价差浮动';
    }
    return '未知';
  }

  private toFixedPriceDetails(
    entity: FixedPriceDetailsEntity,
  ): Record<string, boolean | number | null> {
    return {
      fixed_price_ratio: entity.fixedPriceRatio,
      market_transaction_price: entity.marketTransactionPrice,
      price_limit: entity.priceLimit,
    };
  }

  private toProportionSharingDetails(
    entity: ProportionSharingDetailsEntity,
  ): Record<string, boolean | number | null> {
    return {
      ps_prop_sharing_ratio: entity.psPropSharingRatio,
      ps_dist_ref_price: entity.psDistRefPrice,
      ps_long_term_trans_ratio: entity.psLongTermTransRatio,
      ps_party_a_prop_below_long_term: entity.psPartyAPropBelowLongTerm,
      ps_party_b_prop_below_long_term: entity.psPartyBPropBelowLongTerm,
      ps_party_a_prop_above_long_term: entity.psPartyAPropAboveLongTerm,
      ps_party_b_prop_above_long_term: entity.psPartyBPropAboveLongTerm,
      ps_monthly_bid_ratio: entity.psMonthlyBidRatio,
      ps_party_a_prop_below_monthly_bid: entity.psPartyAPropBelowMonthlyBid,
      ps_party_b_prop_below_monthly_bid: entity.psPartyBPropBelowMonthlyBid,
      ps_party_a_prop_above_monthly_bid: entity.psPartyAPropAboveMonthlyBid,
      ps_party_b_prop_above_monthly_bid: entity.psPartyBPropAboveMonthlyBid,
      ps_agent_proc_ratio: entity.psAgentProcRatio,
      ps_party_a_prop_below_agent_proc: entity.psPartyAPropBelowAgentProc,
      ps_party_b_prop_below_agent_proc: entity.psPartyBPropBelowAgentProc,
      ps_party_a_prop_above_agent_proc: entity.psPartyAPropAboveAgentProc,
      ps_party_b_prop_above_agent_proc: entity.psPartyBPropAboveAgentProc,
      ps_intra_month_ratio: entity.psIntraMonthRatio,
      ps_party_a_prop_below_intra_month: entity.psPartyAPropBelowIntraMonth,
      ps_party_b_prop_below_intra_month: entity.psPartyBPropBelowIntraMonth,
      ps_party_a_prop_above_intra_month: entity.psPartyAPropAboveIntraMonth,
      ps_party_b_prop_above_intra_month: entity.psPartyBPropAboveIntraMonth,
      ps_long_term_trans_limit: entity.psLongTermTransLimit,
      ps_monthly_bid_limit: entity.psMonthlyBidLimit,
      ps_agent_proc_limit: entity.psAgentProcLimit,
      ps_intra_month_limit: entity.psIntraMonthLimit,
    };
  }

  private toPriceDifferenceDetails(
    entity: PriceDifferenceDetailsEntity,
  ): Record<string, boolean | number | null> {
    return {
      pd_price_diff_fluc_ratio: entity.pdPriceDiffFlucRatio,
      pd_long_term_trans_ratio: entity.pdLongTermTransRatio,
      pd_long_term_trans_avg_price: entity.pdLongTermTransAvgPrice,
      pd_long_term_trans_direction: entity.pdLongTermTransDirection,
      pd_monthly_bid_ratio: entity.pdMonthlyBidRatio,
      pd_monthly_bid_clear_price: entity.pdMonthlyBidClearPrice,
      pd_monthly_bid_direction: entity.pdMonthlyBidDirection,
      pd_agent_proc_ratio: entity.pdAgentProcRatio,
      pd_agent_avg_price: entity.pdAgentAvgPrice,
      pd_agent_direction: entity.pdAgentDirection,
      pd_intra_month_ratio: entity.pdIntraMonthRatio,
      pd_intra_month_avg_price: entity.pdIntraMonthAvgPrice,
      pd_intra_month_direction: entity.pdIntraMonthDirection,
      pd_long_term_trans_limit: entity.pdLongTermTransLimit,
      pd_monthly_bid_limit: entity.pdMonthlyBidLimit,
      pd_agent_proc_limit: entity.pdAgentProcLimit,
      pd_intra_month_limit: entity.pdIntraMonthLimit,
    };
  }
}
