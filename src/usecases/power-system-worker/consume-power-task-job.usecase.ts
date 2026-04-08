import { Injectable } from '@nestjs/common';
import { RunPowerTaskPipelineUsecase } from '@usecases/power-system/power-consumption/run-power-task-pipeline.usecase';

export interface ConsumePowerTaskJobUsecaseInput {
  readonly taskId: number;
}

export interface ConsumePowerTaskJobUsecaseResult {
  readonly accepted: boolean;
  readonly taskId: number;
}

@Injectable()
export class ConsumePowerTaskJobUsecase {
  constructor(private readonly runPowerTaskPipelineUsecase: RunPowerTaskPipelineUsecase) {}

  async process(input: ConsumePowerTaskJobUsecaseInput): Promise<ConsumePowerTaskJobUsecaseResult> {
    await this.runPowerTaskPipelineUsecase.execute({
      taskId: input.taskId,
    });

    return {
      accepted: true,
      taskId: input.taskId,
    };
  }
}
