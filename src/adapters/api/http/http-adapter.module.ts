import { Module } from '@nestjs/common';
import { PowerSystemUsecasesModule } from '@usecases/power-system/power-system-usecases.module';
import { PowerSystemBillDocxController } from './power-system/bill/bill-docx.controller';
import { PowerSystemContractDocxController } from './power-system/contract/contract-docx.controller';
import { PowerSystemPowerReportController } from './power-system/power-consumption/power-report.controller';
import { PowerSystemPowerTaskController } from './power-system/power-consumption/power-task.controller';

@Module({
  imports: [PowerSystemUsecasesModule],
  controllers: [
    PowerSystemContractDocxController,
    PowerSystemBillDocxController,
    PowerSystemPowerReportController,
    PowerSystemPowerTaskController,
  ],
})
export class HttpAdapterModule {}
