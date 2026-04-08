import { Module } from '@nestjs/common';
import { PowerSystemWorkerUsecasesModule } from '@src/usecases/power-system-worker/power-system-worker-usecases.module';
import { PowerTaskHandler } from './power-task.handler';
import { PowerTaskProcessor } from './power-task.processor';

@Module({
  imports: [PowerSystemWorkerUsecasesModule],
  providers: [PowerTaskHandler, PowerTaskProcessor],
})
export class PowerSystemWorkerAdapterModule {}
