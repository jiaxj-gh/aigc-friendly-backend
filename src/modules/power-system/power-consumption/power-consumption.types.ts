export interface PowerCompaniesView {
  readonly items: readonly string[];
}

export interface PowerDailySummaryFilters {
  readonly companyName: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface PowerDailySummaryAggregateRow {
  readonly recordDate: string;
  readonly totalEnergyKwh: number;
}

export interface PowerForecastReportRow {
  readonly companyName: string;
  readonly recordDate: string;
  readonly values: Record<string, number | null>;
}

export interface IntervalSummaryAggregateRow {
  readonly recordDate: string;
  readonly values: Record<string, number | null>;
}

export interface PowerIntervalSummaryFilters {
  readonly companyName: string;
  readonly startDate: string;
  readonly endDate: string;
}

export interface PowerCompanyJobsFilters {
  readonly companyName: string;
}

export interface PowerTaskStatusFilters {
  readonly taskId: number;
}

export interface PowerConsumptionMissingDatesResult {
  readonly hasMissingDates: boolean;
  readonly missingDates: readonly string[];
}

export interface PowerDailySummaryDayView {
  readonly summaryDate: string;
  readonly actualEnergyKwh: number | null;
  readonly forecastEnergyKwh: number | null;
  readonly forecastDeviation: number | null;
}

export interface PowerDailySummaryView {
  readonly companyName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly days: readonly PowerDailySummaryDayView[];
}

export interface PowerIntervalSummaryPointView {
  readonly timestamp: Date;
  readonly actualEnergyKwh: number | null;
  readonly forecastEnergyKwh: number | null;
}

export interface PowerIntervalSummaryView {
  readonly companyName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly points: readonly PowerIntervalSummaryPointView[];
  readonly needUpload: boolean;
  readonly forecastReport: string;
}

export interface PowerCompanyJobRecord {
  readonly taskId: number;
  readonly taskName: string | null;
  readonly predictedDate: string;
  readonly status: string;
  readonly errorMessage: string | null;
}

export interface PowerCompanyJobView {
  readonly taskId: number;
  readonly taskName: string | null;
  readonly predictedDate: string;
  readonly status: string;
  readonly errorMessage: string | null;
}

export interface PowerCompanyJobsView {
  readonly companyName: string;
  readonly jobs: readonly PowerCompanyJobView[];
  readonly inProgress: boolean;
}

export interface PowerTaskUploadFileView {
  readonly fileId: string;
  readonly name: string;
  readonly size: number | null;
  readonly status: string;
  readonly errorMessage: string | null;
}

export interface PowerTaskCompanyDatesView {
  readonly companyName: string;
  readonly dates: readonly string[];
}

export interface PowerTaskUploadSummaryView {
  readonly startTime: Date | null;
  readonly endTime: Date | null;
  readonly totalFiles: number;
  readonly uploadedFiles: number;
  readonly failedFiles: number;
  readonly files: readonly PowerTaskUploadFileView[];
  readonly companyDates: readonly PowerTaskCompanyDatesView[];
}

export interface PowerTaskComputeJobView {
  readonly companyName: string;
  readonly predictedDate: string;
  readonly status: string;
  readonly errorMessage: string | null;
}

export interface PowerTaskComputeSummaryView {
  readonly startTime: Date | null;
  readonly endTime: Date | null;
  readonly totalJobs: number;
  readonly successfulJobs: number;
  readonly failedJobs: number;
  readonly progress: number;
  readonly jobs: readonly PowerTaskComputeJobView[];
}

export interface PowerTaskStatusView {
  readonly taskId: number;
  readonly taskName: string | null;
  readonly status: string;
  readonly startTime: Date | null;
  readonly endTime: Date | null;
  readonly upload: PowerTaskUploadSummaryView;
  readonly compute: PowerTaskComputeSummaryView;
  readonly errorMessage: string | null;
}
