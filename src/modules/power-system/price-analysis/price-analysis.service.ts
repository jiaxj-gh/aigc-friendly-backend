import { Injectable } from '@nestjs/common';
import { PriceAnalysisExcelRenderer } from '@src/infrastructure/price-analysis/price-analysis-excel.renderer';
import { PriceAnalysisPdfExtractor } from '@src/infrastructure/price-analysis/price-analysis-pdf.extractor';
import type {
  PriceAnalysisJsonDataEntry,
  PriceAnalysisProgressReporter,
  PriceAnalysisResult,
  PriceAnalysisSavedFile,
} from './price-analysis.types';

const DOCUMENT_TYPES = {
  CENTRAL_BIDDING_PUBLICITY: '电力集中竞价交易公示',
  CENTRAL_BIDDING_RESULT: '电力集中竞价交易结果公示',
  CONTINUOUS_TRANSACTION_RESULT: '电力市场月内连续交易结果公示',
  GREEN_BILATERAL_RESULT: '绿色双边协商交易结果公示',
  MONTHLY_GREEN_BILATERAL_RESULT: '月内绿色双边协商交易结果公示',
} as const;

type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

type ExtractedFileRecord = {
  readonly name: string;
  readonly type: DocumentType;
  readonly date: string;
  readonly content: string;
};

@Injectable()
export class PriceAnalysisService {
  constructor(
    private readonly priceAnalysisPdfExtractor: PriceAnalysisPdfExtractor,
    private readonly priceAnalysisExcelRenderer: PriceAnalysisExcelRenderer,
  ) {}

  async analyzePdfFiles(params: {
    readonly files: readonly PriceAnalysisSavedFile[];
    readonly progress?: PriceAnalysisProgressReporter;
  }): Promise<PriceAnalysisResult> {
    const warnings: string[] = [];
    const extractedFiles: ExtractedFileRecord[] = [];
    const mapping = await this.priceAnalysisExcelRenderer.loadFieldMapping();

    await emitProgress(params.progress, '开始处理PDF文件...');
    await emitProgress(params.progress, '步骤1: 识别文档类型和日期...');

    let targetDate: string | null = null;
    for (const file of params.files) {
      await emitProgress(params.progress, `正在分析文件: ${file.name}`);
      const content = await this.priceAnalysisPdfExtractor.extractText(file.content);
      const type = detectDocumentType(content);
      const date = extractDocumentDate(content);

      if (!type || !date) {
        const warning = `无法识别文件 ${file.name} 的文档类型或日期`;
        warnings.push(warning);
        await emitProgress(params.progress, `  - 警告: ${warning}`);
        continue;
      }

      extractedFiles.push({
        name: file.name,
        type,
        date,
        content,
      });

      await emitProgress(params.progress, `  - 识别结果: 类型=${type}, 日期=${date}`);
      if (type === DOCUMENT_TYPES.CENTRAL_BIDDING_PUBLICITY) {
        targetDate = date;
        await emitProgress(params.progress, `  - 找到目标日期基准文件: ${date}`);
      }
    }

    if (!targetDate && extractedFiles.length > 0) {
      targetDate = extractedFiles[0].date;
      const warning = `未找到'电力集中竞价交易公示'文件，以文件 ${extractedFiles[0].name} 的日期 ${targetDate} 为准。`;
      warnings.push(warning);
      await emitProgress(params.progress, `  - 警告: ${warning}`);
    }

    if (!targetDate) {
      throw new Error('未能识别任何有效的电价分析 PDF 文件');
    }

    await emitProgress(params.progress, '步骤2: 提取详细数据...');
    await emitProgress(params.progress, `  - 目标日期: ${targetDate}`);

    const valuesByColumn: Record<string, number | null> = {};
    const jsonData: PriceAnalysisJsonDataEntry[] = [];

    for (const item of extractedFiles) {
      await emitProgress(params.progress, `  - 处理文件: ${item.name} (${item.type})`);
      const data = extractFileData(item.type, item.content);
      await emitProgress(params.progress, `    - 数据提取成功: ${JSON.stringify(data, null, 0)}`);
      jsonData.push({
        filename: item.name,
        filetype: item.type,
        data,
      });

      const typeMapping = mapping[item.type] ?? {};
      for (const [fieldName, column] of Object.entries(typeMapping)) {
        if (Object.prototype.hasOwnProperty.call(data, fieldName)) {
          valuesByColumn[column] = data[fieldName] ?? null;
        }
      }
    }

    await emitProgress(params.progress, '步骤3: 填充Excel...');
    const rendered = await this.priceAnalysisExcelRenderer.render({
      targetDate,
      valuesByColumn,
    });
    await emitProgress(params.progress, `  - 输出文件名: ${rendered.filename}`);
    await emitProgress(params.progress, '处理完成。');

    return {
      filename: rendered.filename,
      content: rendered.content,
      warnings,
      jsonData,
    };
  }
}

async function emitProgress(
  progress: PriceAnalysisProgressReporter | undefined,
  message: string,
): Promise<void> {
  if (!progress) {
    return;
  }

  await progress(message);
}

function detectDocumentType(content: string): DocumentType | null {
  const normalized = content.toLowerCase();

  if (
    normalized.includes('月内绿色双边协商交易结果公示') ||
    normalized.includes('monthly_green_bilateral_result')
  ) {
    return DOCUMENT_TYPES.MONTHLY_GREEN_BILATERAL_RESULT;
  }

  if (
    normalized.includes('绿色双边协商交易结果公示') ||
    normalized.includes('green_bilateral_result')
  ) {
    return DOCUMENT_TYPES.GREEN_BILATERAL_RESULT;
  }

  if (
    normalized.includes('电力市场月内连续交易结果公示') ||
    normalized.includes('continuous_transaction_result')
  ) {
    return DOCUMENT_TYPES.CONTINUOUS_TRANSACTION_RESULT;
  }

  if (
    normalized.includes('电力集中竞价交易结果公示') ||
    normalized.includes('central_bidding_result')
  ) {
    return DOCUMENT_TYPES.CENTRAL_BIDDING_RESULT;
  }

  if (
    normalized.includes('电力集中竞价交易公示') ||
    normalized.includes('电力集中竞价交易公告') ||
    normalized.includes('central_bidding_publicity')
  ) {
    return DOCUMENT_TYPES.CENTRAL_BIDDING_PUBLICITY;
  }

  return null;
}

function extractDocumentDate(content: string): string | null {
  const patterns = [/(\d{4})\s*年\s*(\d{1,2})\s*月/, /(\d{4})[-/.](\d{1,2})/];

  for (const pattern of patterns) {
    const match = pattern.exec(content);
    if (!match) {
      continue;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      continue;
    }

    return `${String(year)}年${String(month).padStart(2, '0')}月`;
  }

  return null;
}

function extractFileData(
  documentType: DocumentType,
  content: string,
): Record<string, number | null> {
  switch (documentType) {
    case DOCUMENT_TYPES.CENTRAL_BIDDING_PUBLICITY:
      return buildFieldMap(content, {
        同期月度总电量: ['同期月度总电量', 'monthly_total_same_period'],
        上报月份计划用电: ['上报月份计划用电', 'reported_monthly_planned_power'],
        国网代理采购电量: ['国网代理采购电量', 'grid_agent_purchase_power'],
      });
    case DOCUMENT_TYPES.CENTRAL_BIDDING_RESULT:
      return buildFieldMap(content, {
        发电企业数量: ['发电企业数量', 'generator_company_count'],
        售电公司数量: ['售电公司数量', 'retail_company_count'],
        一类用户数量: ['一类用户数量', 'class1_user_count'],
        发电企业总申报电量: ['发电企业总申报电量', 'generator_declared_energy'],
        售电公司总申报电量: ['售电公司总申报电量', 'retail_declared_energy'],
        一类用户总申报电量: ['一类用户总申报电量', 'class1_declared_energy'],
        售电公司成交电量: ['售电公司成交电量', 'retail_traded_energy'],
        一类用户成交电量: ['一类用户成交电量', 'class1_traded_energy'],
        合计成交电量: ['合计成交电量', 'total_traded_energy'],
        成交价格: ['成交价格', 'traded_price'],
        发电企业边际机组报价: ['发电企业边际机组报价', 'generator_marginal_offer'],
        购方边际报价: ['购方边际报价', 'buyer_marginal_offer'],
      });
    case DOCUMENT_TYPES.CONTINUOUS_TRANSACTION_RESULT: {
      const data = buildFieldMap(content, {
        交易发电企业数量: ['交易发电企业数量', 'trading_generator_company_count'],
        交易售电公司数量: ['交易售电公司数量', 'trading_retail_company_count'],
        交易一类用户数量: ['交易一类用户数量', 'trading_class1_user_count'],
        发电企业挂牌电量: ['发电企业挂牌电量', 'generator_listed_energy'],
        发电企业未成交电量: ['发电企业未成交电量', 'generator_untraded_energy'],
        售电公司售方挂牌电量: ['售电公司售方挂牌电量', 'retail_sell_listed_energy'],
        售电公司售方未成交电量: ['售电公司售方未成交电量', 'retail_sell_untraded_energy'],
        一类用户售方挂牌电量: ['一类用户售方挂牌电量', 'class1_sell_listed_energy'],
        一类用户售方未成交电量: ['一类用户售方未成交电量', 'class1_sell_untraded_energy'],
        售电公司购方挂牌电量: ['售电公司购方挂牌电量', 'retail_buy_listed_energy'],
        售电公司购方未成交电量: ['售电公司购方未成交电量', 'retail_buy_untraded_energy'],
        一类用户购方挂牌电量: ['一类用户购方挂牌电量', 'class1_buy_listed_energy'],
        一类用户购方未成交电量: ['一类用户购方未成交电量', 'class1_buy_untraded_energy'],
        发电企业成交电量: ['发电企业成交电量', 'generator_traded_energy'],
        售电公司售方成交电量: ['售电公司售方成交电量', 'retail_sell_traded_energy'],
        一类用户售方成交电量: ['一类用户售方成交电量', 'class1_sell_traded_energy'],
        售电公司购方成交电量: ['售电公司购方成交电量', 'retail_buy_traded_energy'],
        一类用户购方成交电量: ['一类用户购方成交电量', 'class1_buy_traded_energy'],
        最终成交电量: ['最终成交电量', 'final_traded_energy'],
        最终成交均价: ['最终成交均价', 'final_traded_price'],
      });

      applyDerivedContinuousTransactionFields(data);
      return pickFields(data, [
        '交易发电企业数量',
        '交易售电公司数量',
        '交易一类用户数量',
        '发电企业挂牌电量',
        '售电公司售方挂牌电量',
        '一类用户售方挂牌电量',
        '发电企业成交电量',
        '售电公司售方成交电量',
        '一类用户售方成交电量',
        '售电公司购方挂牌电量',
        '一类用户购方挂牌电量',
        '售电公司购方成交电量',
        '一类用户购方成交电量',
        '最终成交电量',
        '最终成交均价',
      ]);
    }
    case DOCUMENT_TYPES.GREEN_BILATERAL_RESULT:
    case DOCUMENT_TYPES.MONTHLY_GREEN_BILATERAL_RESULT:
      return buildFieldMap(content, {
        成交电量: ['成交电量', 'traded_energy'],
        交易均价: ['交易均价', 'average_price'],
      });
    default:
      return {};
  }
}

function buildFieldMap(
  content: string,
  fieldAliases: Readonly<Record<string, readonly string[]>>,
): Record<string, number | null> {
  return Object.entries(fieldAliases).reduce<Record<string, number | null>>(
    (acc, [field, aliases]) => {
      acc[field] = extractNumericField(content, aliases);
      return acc;
    },
    {},
  );
}

function applyDerivedContinuousTransactionFields(data: Record<string, number | null>): void {
  const calculations: Array<readonly [string, string, string]> = [
    ['发电企业成交电量', '发电企业挂牌电量', '发电企业未成交电量'],
    ['售电公司售方成交电量', '售电公司售方挂牌电量', '售电公司售方未成交电量'],
    ['一类用户售方成交电量', '一类用户售方挂牌电量', '一类用户售方未成交电量'],
    ['售电公司购方成交电量', '售电公司购方挂牌电量', '售电公司购方未成交电量'],
    ['一类用户购方成交电量', '一类用户购方挂牌电量', '一类用户购方未成交电量'],
  ];

  for (const [targetField, listedField, untradedField] of calculations) {
    if (typeof data[targetField] === 'number') {
      continue;
    }

    const listed = data[listedField] ?? 0;
    const untraded = data[untradedField] ?? 0;
    data[targetField] = listed - untraded;
  }
}

function pickFields(
  input: Readonly<Record<string, number | null>>,
  fields: readonly string[],
): Record<string, number | null> {
  return fields.reduce<Record<string, number | null>>((acc, field) => {
    acc[field] = input[field] ?? null;
    return acc;
  }, {});
}

function extractNumericField(content: string, aliases: readonly string[]): number | null {
  for (const alias of aliases) {
    const patterns = [
      new RegExp(`${escapeRegExp(alias)}\\s*[：:]?\\s*(-?\\d+(?:,\\d{3})*(?:\\.\\d+)?)`, 'i'),
      new RegExp(`${escapeRegExp(alias)}[^\\d-]{0,12}(-?\\d+(?:,\\d{3})*(?:\\.\\d+)?)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(content);
      if (!match) {
        continue;
      }

      const raw = match[1].replace(/,/g, '');
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
