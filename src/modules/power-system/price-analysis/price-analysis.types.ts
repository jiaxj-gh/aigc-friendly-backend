export interface PriceAnalysisSavedFile {
  readonly name: string;
  readonly content: Buffer;
}

export interface PriceAnalysisJsonDataEntry {
  readonly filename: string;
  readonly filetype: string;
  readonly data: Readonly<Record<string, number | null>>;
}

export interface PriceAnalysisResult {
  readonly filename: string;
  readonly content: Buffer;
  readonly warnings: readonly string[];
  readonly jsonData: readonly PriceAnalysisJsonDataEntry[];
}

export type PriceAnalysisProgressReporter = (message: string) => Promise<void> | void;
