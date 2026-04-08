export interface QuotationListFilters {
  readonly contractId: number;
  readonly quoteTypeId: number;
}

export interface QuotationView {
  readonly id: number;
  readonly contractId: number;
  readonly quoteTypeId: number;
  readonly quoteType: string;
  readonly greenElecAllow: boolean;
  readonly greenElecPrice: number | null;
  readonly tradeStartTime: string;
  readonly tradeEndTime: string;
  readonly totalElectricity: number;
  readonly monthlyElectricity: Record<string, number>;
  readonly electricityDeviation: number | null;
  readonly positiveDeviationRatio: number | null;
  readonly positiveDeviationPrice: number | null;
  readonly negativeDeviationRatio: number | null;
  readonly negativeDeviationPrice: number | null;
  readonly standardCurveMethod: boolean;
  readonly curveModifyDays: number | null;
  readonly curveDeviation: number | null;
  readonly curvePositiveRatio: number | null;
  readonly curvePositivePrice: number | null;
  readonly curveNegativeRatio: number | null;
  readonly curveNegativePrice: number | null;
  readonly quoteDetails: Record<string, boolean | number | null>;
}
