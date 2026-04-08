import { Module } from '@nestjs/common';
import { AsyncTaskRecordModule } from '@src/modules/async-task-record/async-task-record.module';
import { PowerConsumptionWorkerModule } from '@modules/power-system/power-consumption-worker/power-consumption-worker.module';
import { ConsumePowerTaskJobUsecase } from './consume-power-task-job.usecase';

@Module({
  imports: [PowerConsumptionWorkerModule, AsyncTaskRecordModule],
  providers: [ConsumePowerTaskJobUsecase],
  exports: [ConsumePowerTaskJobUsecase],
})
export class PowerSystemWorkerUsecasesModule {}
