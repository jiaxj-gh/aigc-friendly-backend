import { Module } from '@nestjs/common';
import { PowerSystemModule } from '@modules/power-system/power-system.module';
import { GenerateBillDocxUsecase } from './bill/generate-bill-docx.usecase';
import { CreateContractUsecase } from './contract/create-contract.usecase';
import { DeleteContractUsecase } from './contract/delete-contract.usecase';
import { GenerateContractDocxUsecase } from './contract/generate-contract-docx.usecase';
import { GetContractUsecase } from './contract/get-contract.usecase';
import { ListContractsUsecase } from './contract/list-contracts.usecase';
import { UpdateContractUsecase } from './contract/update-contract.usecase';
import { CreatePartyAUsecase } from './party-a/create-party-a.usecase';
import { DeletePartyAUsecase } from './party-a/delete-party-a.usecase';
import { GetPartyAUsecase } from './party-a/get-party-a.usecase';
import { ListPartyAsUsecase } from './party-a/list-party-as.usecase';
import { UpdatePartyAUsecase } from './party-a/update-party-a.usecase';
import { CreatePartyBUsecase } from './party-b/create-party-b.usecase';
import { DeletePartyBUsecase } from './party-b/delete-party-b.usecase';
import { GetPartyBUsecase } from './party-b/get-party-b.usecase';
import { ListPartyBsUsecase } from './party-b/list-party-bs.usecase';
import { UpdatePartyBUsecase } from './party-b/update-party-b.usecase';
import { ExecutePowerTaskUsecase } from './power-consumption/execute-power-task.usecase';
import { GeneratePowerReportUsecase } from './power-consumption/generate-power-report.usecase';
import { GetPowerDailySummaryUsecase } from './power-consumption/get-power-daily-summary.usecase';
import { GetPowerCompanyJobsUsecase } from './power-consumption/get-power-company-jobs.usecase';
import { GetPowerIntervalSummaryUsecase } from './power-consumption/get-power-interval-summary.usecase';
import { GetPowerTaskStatusUsecase } from './power-consumption/get-power-task-status.usecase';
import { ListPowerCompaniesUsecase } from './power-consumption/list-power-companies.usecase';
import { QueuePowerTaskUsecase } from './power-consumption/queue-power-task.usecase';
import { RunPowerTaskPipelineUsecase } from './power-consumption/run-power-task-pipeline.usecase';
import { ExecutePriceAnalysisUsecase } from './price-analysis/execute-price-analysis.usecase';
import { GetQuotationByContractTypeUsecase } from './quotation/get-quotation-by-contract-type.usecase';

@Module({
  imports: [PowerSystemModule],
  providers: [
    GenerateBillDocxUsecase,
    CreateContractUsecase,
    DeleteContractUsecase,
    GenerateContractDocxUsecase,
    CreatePartyAUsecase,
    DeletePartyAUsecase,
    GetPartyAUsecase,
    GetContractUsecase,
    ListPartyAsUsecase,
    UpdatePartyAUsecase,
    ListContractsUsecase,
    UpdateContractUsecase,
    ListPartyBsUsecase,
    GetPartyBUsecase,
    CreatePartyBUsecase,
    UpdatePartyBUsecase,
    DeletePartyBUsecase,
    GetPowerCompanyJobsUsecase,
    GetPowerDailySummaryUsecase,
    GetPowerIntervalSummaryUsecase,
    GetPowerTaskStatusUsecase,
    GeneratePowerReportUsecase,
    ListPowerCompaniesUsecase,
    ExecutePowerTaskUsecase,
    QueuePowerTaskUsecase,
    RunPowerTaskPipelineUsecase,
    ExecutePriceAnalysisUsecase,
    GetQuotationByContractTypeUsecase,
  ],
  exports: [
    GenerateBillDocxUsecase,
    CreateContractUsecase,
    DeleteContractUsecase,
    GenerateContractDocxUsecase,
    CreatePartyAUsecase,
    DeletePartyAUsecase,
    GetPartyAUsecase,
    GetContractUsecase,
    ListPartyAsUsecase,
    UpdatePartyAUsecase,
    ListContractsUsecase,
    UpdateContractUsecase,
    ListPartyBsUsecase,
    GetPartyBUsecase,
    CreatePartyBUsecase,
    UpdatePartyBUsecase,
    DeletePartyBUsecase,
    GetPowerCompanyJobsUsecase,
    GetPowerDailySummaryUsecase,
    GetPowerIntervalSummaryUsecase,
    GetPowerTaskStatusUsecase,
    GeneratePowerReportUsecase,
    ListPowerCompaniesUsecase,
    ExecutePowerTaskUsecase,
    QueuePowerTaskUsecase,
    RunPowerTaskPipelineUsecase,
    ExecutePriceAnalysisUsecase,
    GetQuotationByContractTypeUsecase,
  ],
})
export class PowerSystemUsecasesModule {}
