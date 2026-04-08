import { Injectable } from '@nestjs/common';
import { ConsumePowerTaskJobUsecase } from '@src/usecases/power-system-worker/consume-power-task-job.usecase';
import { type PowerRunTaskJob, mapPowerRunTaskJobToProcessInput } from './power-task.mapper';

@Injectable()
export class PowerTaskHandler {
  constructor(private readonly consumePowerTaskJobUsecase: ConsumePowerTaskJobUsecase) {}

  async processRunTask(input: { readonly job: PowerRunTaskJob }) {
    return await this.consumePowerTaskJobUsecase.process(
      mapPowerRunTaskJobToProcessInput({ job: input.job }),
    );
  }
}
