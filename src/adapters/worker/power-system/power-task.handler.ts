import { Injectable } from '@nestjs/common';
import { ConsumePowerTaskJobUsecase } from '@src/usecases/power-system-worker/consume-power-task-job.usecase';
import {
  type PowerRunTaskJob,
  mapMissingPowerRunTaskJobToFailInput,
  mapPowerRunTaskJobToCompleteInput,
  mapPowerRunTaskJobToFailInput,
  mapPowerRunTaskJobToProcessInput,
} from './power-task.mapper';

@Injectable()
export class PowerTaskHandler {
  constructor(private readonly consumePowerTaskJobUsecase: ConsumePowerTaskJobUsecase) {}

  async processRunTask(input: { readonly job: PowerRunTaskJob }) {
    return await this.consumePowerTaskJobUsecase.process(
      mapPowerRunTaskJobToProcessInput({ job: input.job }),
    );
  }

  async onCompleted(input: { readonly job: PowerRunTaskJob }): Promise<void> {
    await this.consumePowerTaskJobUsecase.complete(
      mapPowerRunTaskJobToCompleteInput({ job: input.job }),
    );
  }

  async onFailed(input: {
    readonly job: PowerRunTaskJob | undefined;
    readonly error: Error;
  }): Promise<void> {
    if (!input.job) {
      await this.consumePowerTaskJobUsecase.fail(
        mapMissingPowerRunTaskJobToFailInput({ error: input.error }),
      );
      return;
    }
    await this.consumePowerTaskJobUsecase.fail(
      mapPowerRunTaskJobToFailInput({ job: input.job, error: input.error }),
    );
  }
}
