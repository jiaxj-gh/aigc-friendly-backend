import { Module } from '@nestjs/common';
import { BullMqModule } from '@src/infrastructure/bullmq/bullmq.module';
import { PowerConsumptionQueueService } from './power-consumption-queue.service';

@Module({
  imports: [BullMqModule],
  providers: [PowerConsumptionQueueService],
  exports: [PowerConsumptionQueueService],
})
export class PowerConsumptionQueueModule {}
