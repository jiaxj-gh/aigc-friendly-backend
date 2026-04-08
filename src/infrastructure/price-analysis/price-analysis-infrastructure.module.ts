import { Module } from '@nestjs/common';
import { PriceAnalysisExcelRenderer } from './price-analysis-excel.renderer';
import { PriceAnalysisPdfExtractor } from './price-analysis-pdf.extractor';

@Module({
  providers: [PriceAnalysisPdfExtractor, PriceAnalysisExcelRenderer],
  exports: [PriceAnalysisPdfExtractor, PriceAnalysisExcelRenderer],
})
export class PriceAnalysisInfrastructureModule {}
