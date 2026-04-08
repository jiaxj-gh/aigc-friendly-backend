import { Module } from '@nestjs/common';
import { PowerPredictInfrastructureModule } from '@src/infrastructure/power-predict/power-predict-infrastructure.module';
import { PowerSystemModule } from '@modules/power-system/power-system.module';
import { PowerTaskPipelineService } from './power-task-pipeline.service';

@Module({
  imports: [PowerSystemModule, PowerPredictInfrastructureModule],
  providers: [PowerTaskPipelineService],
  exports: [PowerTaskPipelineService],
})
export class PowerConsumptionWorkerModule {}
