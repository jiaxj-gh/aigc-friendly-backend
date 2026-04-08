import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PowerPredictPort } from '@src/core/power-system/power-predict.port';
import { PowerPredictHttpClient } from './power-predict-http.client';

@Module({
  imports: [HttpModule],
  providers: [
    PowerPredictHttpClient,
    {
      provide: PowerPredictPort,
      useExisting: PowerPredictHttpClient,
    },
  ],
  exports: [PowerPredictPort],
})
export class PowerPredictInfrastructureModule {}
