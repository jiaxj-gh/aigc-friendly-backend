import { ValidateInput } from '@adapters/api/graphql/common/validate-input.decorator';
import { Public } from '@adapters/api/graphql/decorators/public.decorator';
import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  GetPowerDailySummaryUsecase,
  type GetPowerDailySummaryUsecaseResult,
} from '@usecases/power-system/power-consumption/get-power-daily-summary.usecase';
import {
  GetPowerCompanyJobsUsecase,
  type GetPowerCompanyJobsUsecaseResult,
} from '@usecases/power-system/power-consumption/get-power-company-jobs.usecase';
import {
  GetPowerIntervalSummaryUsecase,
  type GetPowerIntervalSummaryUsecaseResult,
} from '@usecases/power-system/power-consumption/get-power-interval-summary.usecase';
import {
  GetPowerTaskStatusUsecase,
  type GetPowerTaskStatusUsecaseResult,
} from '@usecases/power-system/power-consumption/get-power-task-status.usecase';
import { ListPowerCompaniesUsecase } from '@usecases/power-system/power-consumption/list-power-companies.usecase';
import { PowerCompanyJobsInput } from './dto/power-company-jobs.input';
import { PowerCompanyJobsType } from './dto/power-company-jobs.type';
import { PowerDailySummaryInput } from './dto/power-daily-summary.input';
import { PowerDailySummaryType } from './dto/power-daily-summary.type';
import { PowerIntervalSummaryInput } from './dto/power-interval-summary.input';
import { PowerIntervalSummaryType } from './dto/power-interval-summary.type';
import { PowerTaskStatusInput } from './dto/power-task-status.input';
import { PowerTaskStatusType } from './dto/power-task-status.type';

@Resolver()
export class PowerSystemPowerConsumptionResolver {
  constructor(
    private readonly listPowerCompaniesUsecase: ListPowerCompaniesUsecase,
    private readonly getPowerCompanyJobsUsecase: GetPowerCompanyJobsUsecase,
    private readonly getPowerDailySummaryUsecase: GetPowerDailySummaryUsecase,
    private readonly getPowerIntervalSummaryUsecase: GetPowerIntervalSummaryUsecase,
    private readonly getPowerTaskStatusUsecase: GetPowerTaskStatusUsecase,
  ) {}

  @Public()
  @Query(() => [String], {
    description: '查询具备用电量数据的企业名称列表',
  })
  async powerCompanies(): Promise<string[]> {
    return [...(await this.listPowerCompaniesUsecase.execute())];
  }

  @Public()
  @ValidateInput()
  @Query(() => PowerCompanyJobsType, {
    description: '查询企业在当前计算任务中的 job 列表',
  })
  async powerCompanyJobs(
    @Args('input') input: PowerCompanyJobsInput,
  ): Promise<PowerCompanyJobsType> {
    const result = await this.getPowerCompanyJobsUsecase.execute({
      companyName: input.companyName,
    });

    return this.toPowerCompanyJobsType(result);
  }

  private toPowerCompanyJobsType(item: GetPowerCompanyJobsUsecaseResult): PowerCompanyJobsType {
    return {
      companyName: item.companyName,
      jobs: item.jobs.map((job) => ({
        taskId: job.taskId,
        taskName: job.taskName,
        predictedDate: job.predictedDate,
        status: job.status,
        errorMessage: job.errorMessage,
      })),
      inProgress: item.inProgress,
    };
  }

  @Public()
  @ValidateInput()
  @Query(() => PowerTaskStatusType, {
    description: '查询指定用电任务的完整状态快照',
  })
  async powerTaskStatus(@Args('input') input: PowerTaskStatusInput): Promise<PowerTaskStatusType> {
    const result = await this.getPowerTaskStatusUsecase.execute({
      taskId: input.taskId,
    });

    return this.toPowerTaskStatusType(result);
  }

  private toPowerTaskStatusType(item: GetPowerTaskStatusUsecaseResult): PowerTaskStatusType {
    return {
      taskId: item.taskId,
      taskName: item.taskName,
      status: item.status,
      startTime: item.startTime,
      endTime: item.endTime,
      upload: {
        startTime: item.upload.startTime,
        endTime: item.upload.endTime,
        totalFiles: item.upload.totalFiles,
        uploadedFiles: item.upload.uploadedFiles,
        failedFiles: item.upload.failedFiles,
        files: item.upload.files.map((file) => ({
          fileId: file.fileId,
          name: file.name,
          size: file.size,
          status: file.status,
          errorMessage: file.errorMessage,
        })),
        companyDates: item.upload.companyDates.map((entry) => ({
          companyName: entry.companyName,
          dates: [...entry.dates],
        })),
      },
      compute: {
        startTime: item.compute.startTime,
        endTime: item.compute.endTime,
        totalJobs: item.compute.totalJobs,
        successfulJobs: item.compute.successfulJobs,
        failedJobs: item.compute.failedJobs,
        progress: item.compute.progress,
        jobs: item.compute.jobs.map((job) => ({
          companyName: job.companyName,
          predictedDate: job.predictedDate,
          status: job.status,
          errorMessage: job.errorMessage,
        })),
      },
      errorMessage: item.errorMessage,
    };
  }

  @Public()
  @ValidateInput()
  @Query(() => PowerDailySummaryType, {
    description: '查询企业在日期区间内的每日实际与预测电量汇总',
  })
  async powerDailySummary(
    @Args('input') input: PowerDailySummaryInput,
  ): Promise<PowerDailySummaryType> {
    const result = await this.getPowerDailySummaryUsecase.execute({
      companyName: input.companyName,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    return this.toPowerDailySummaryType(result);
  }

  private toPowerDailySummaryType(item: GetPowerDailySummaryUsecaseResult): PowerDailySummaryType {
    return {
      companyName: item.companyName,
      startDate: item.startDate,
      endDate: item.endDate,
      days: item.days.map((day) => ({
        summaryDate: day.summaryDate,
        actualEnergyKwh: day.actualEnergyKwh,
        forecastEnergyKwh: day.forecastEnergyKwh,
        forecastDeviation: day.forecastDeviation,
      })),
    };
  }

  @Public()
  @ValidateInput()
  @Query(() => PowerIntervalSummaryType, {
    description: '查询企业在日期区间内的 15 分钟实际与预测电量汇总',
  })
  async powerIntervalSummary(
    @Args('input') input: PowerIntervalSummaryInput,
  ): Promise<PowerIntervalSummaryType> {
    const result = await this.getPowerIntervalSummaryUsecase.execute({
      companyName: input.companyName,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    return this.toPowerIntervalSummaryType(result);
  }

  private toPowerIntervalSummaryType(
    item: GetPowerIntervalSummaryUsecaseResult,
  ): PowerIntervalSummaryType {
    return {
      companyName: item.companyName,
      startDate: item.startDate,
      endDate: item.endDate,
      points: item.points.map((point) => ({
        timestamp: point.timestamp,
        actualEnergyKwh: point.actualEnergyKwh,
        forecastEnergyKwh: point.forecastEnergyKwh,
      })),
      needUpload: item.needUpload,
      forecastReport: item.forecastReport,
    };
  }
}
