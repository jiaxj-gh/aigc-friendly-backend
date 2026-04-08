import { Module } from '@nestjs/common';
import { PowerSystemModule } from '@modules/power-system/power-system.module';
import { RunPowerTaskPipelineUsecase } from '@usecases/power-system/power-consumption/run-power-task-pipeline.usecase';
import { ConsumePowerTaskJobUsecase } from './consume-power-task-job.usecase';

@Module({
  imports: [PowerSystemModule],
  providers: [RunPowerTaskPipelineUsecase, ConsumePowerTaskJobUsecase],
  exports: [ConsumePowerTaskJobUsecase],
})
export class PowerSystemWorkerUsecasesModule {}
