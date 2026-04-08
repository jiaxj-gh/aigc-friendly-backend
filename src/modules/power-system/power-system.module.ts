import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocxInfrastructureModule } from '@src/infrastructure/docx/docx-infrastructure.module';
import { PriceAnalysisInfrastructureModule } from '@src/infrastructure/price-analysis/price-analysis-infrastructure.module';
import { BillDocxService } from './bill/bill-docx.service';
import { ContractEntity } from './contract/contract.entity';
import { ContractDocxService } from './contract/contract-docx.service';
import { ContractService } from './contract/contract.service';
import { ContractQueryService } from './contract/queries/contract.query.service';
import { PartyAEntity } from './party-a/party-a.entity';
import { PartyAService } from './party-a/party-a.service';
import { PartyAQueryService } from './party-a/queries/party-a.query.service';
import { PowerSupplyEntity } from './party-a/power-supply.entity';
import { PartyBEntity } from './party-b/party-b.entity';
import { PartyBQueryService } from './party-b/queries/party-b.query.service';
import { PartyBService } from './party-b/party-b.service';
import { ActualPowerConsumptionEntity } from './power-consumption/actual-power-consumption.entity';
import { ForecastPowerConsumptionEntity } from './power-consumption/forecast-power-consumption.entity';
import { PowerConsumptionQueryService } from './power-consumption/queries/power-consumption.query.service';
import { PowerConsumptionService } from './power-consumption/power-consumption.service';
import { PowerTaskSummaryEntity } from './power-consumption/power-task-summary.entity';
import { PriceAnalysisService } from './price-analysis/price-analysis.service';
import { FixedPriceDetailsEntity } from './quotation/fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from './quotation/price-difference-details.entity';
import { QuotationQueryService } from './quotation/queries/quotation.query.service';
import { QuotationEntity } from './quotation/quotation.entity';
import { ProportionSharingDetailsEntity } from './quotation/proportion-sharing-details.entity';
import { QuotationService } from './quotation/quotation.service';

@Module({
  imports: [
    DocxInfrastructureModule,
    PriceAnalysisInfrastructureModule,
    TypeOrmModule.forFeature([
      PartyAEntity,
      PowerSupplyEntity,
      PartyBEntity,
      ActualPowerConsumptionEntity,
      ForecastPowerConsumptionEntity,
      PowerTaskSummaryEntity,
      ContractEntity,
      QuotationEntity,
      FixedPriceDetailsEntity,
      ProportionSharingDetailsEntity,
      PriceDifferenceDetailsEntity,
    ]),
  ],
  providers: [
    BillDocxService,
    PartyAService,
    PartyAQueryService,
    PartyBService,
    PartyBQueryService,
    PowerConsumptionService,
    PowerConsumptionQueryService,
    PriceAnalysisService,
    ContractDocxService,
    ContractService,
    ContractQueryService,
    QuotationService,
    QuotationQueryService,
  ],
  exports: [
    BillDocxService,
    PartyAService,
    PartyAQueryService,
    PartyBService,
    PartyBQueryService,
    PowerConsumptionService,
    PowerConsumptionQueryService,
    PriceAnalysisService,
    ContractDocxService,
    ContractService,
    ContractQueryService,
    QuotationService,
    QuotationQueryService,
  ],
})
export class PowerSystemModule {}
