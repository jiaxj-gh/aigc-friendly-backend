import { Module } from '@nestjs/common';
import { PowerSystemUsecasesModule } from '@usecases/power-system/power-system-usecases.module';
import { PowerSystemPriceAnalysisWsAdapter } from './power-system/price-analysis/price-analysis.ws-adapter';

@Module({
  imports: [PowerSystemUsecasesModule],
  providers: [PowerSystemPriceAnalysisWsAdapter],
})
export class WsAdapterModule {}
