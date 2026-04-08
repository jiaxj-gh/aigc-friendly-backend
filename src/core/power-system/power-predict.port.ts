export interface PowerPredictRequest {
  readonly companyId: string;
  readonly lastHistoricalDate: string;
  readonly historicalData: readonly number[];
}

export abstract class PowerPredictPort {
  abstract loadPredict(input: PowerPredictRequest): Promise<readonly number[]>;
}
