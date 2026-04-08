import { existsSync, promises as fs } from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

type PriceAnalysisFieldMapping = Record<string, Record<string, string>>;

@Injectable()
export class PriceAnalysisExcelRenderer {
  private mappingCache: PriceAnalysisFieldMapping | null = null;

  async loadFieldMapping(): Promise<PriceAnalysisFieldMapping> {
    if (this.mappingCache) {
      return this.mappingCache;
    }

    const mappingPath = resolveTemplateAssetPath('elec_price_dict.json');
    const raw = await fs.readFile(mappingPath, 'utf8');
    const parsed = JSON.parse(raw) as PriceAnalysisFieldMapping;
    this.mappingCache = parsed;
    return parsed;
  }

  async render(params: {
    readonly targetDate: string;
    readonly valuesByColumn: Readonly<Record<string, number | null>>;
  }): Promise<{ filename: string; content: Buffer }> {
    const templatePath = resolveTemplateAssetPath('elec_price_tmplate.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('电价分析模板缺少工作表');
    }

    const targetRow = 5;
    for (const [column, value] of Object.entries(params.valuesByColumn)) {
      if (value === null || typeof value === 'undefined') {
        continue;
      }

      worksheet.getCell(`${column}${String(targetRow)}`).value = value;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      filename: `电价分析_${params.targetDate}.xlsx`,
      content: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
    };
  }
}

function resolveTemplateAssetPath(fileName: string): string {
  const cwdPath = path.resolve(
    process.cwd(),
    'src',
    'infrastructure',
    'price-analysis',
    'templates',
    fileName,
  );
  const currentDirPath = path.resolve(__dirname, 'templates', fileName);
  const distSiblingPath = path.resolve(
    __dirname,
    '..',
    '..',
    'infrastructure',
    'price-analysis',
    'templates',
    fileName,
  );

  const resolvedPath = [cwdPath, currentDirPath, distSiblingPath].find((candidate) =>
    existsSync(candidate),
  );

  return resolvedPath ?? cwdPath;
}
