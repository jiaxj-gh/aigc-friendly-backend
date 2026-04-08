import { Injectable } from '@nestjs/common';
import { PriceAnalysisService } from '@modules/power-system/price-analysis/price-analysis.service';
import type {
  PriceAnalysisProgressReporter,
  PriceAnalysisResult,
  PriceAnalysisSavedFile,
} from '@modules/power-system/price-analysis/price-analysis.types';
import {
  normalizeExecutePriceAnalysisInput,
  type NormalizeExecutePriceAnalysisInput,
} from './execute-price-analysis.input.normalize';

export type ExecutePriceAnalysisUsecaseParams = NormalizeExecutePriceAnalysisInput;

@Injectable()
export class ExecutePriceAnalysisUsecase {
  constructor(private readonly priceAnalysisService: PriceAnalysisService) {}

  async execute(
    params: ExecutePriceAnalysisUsecaseParams,
    progress?: PriceAnalysisProgressReporter,
  ): Promise<PriceAnalysisResult> {
    const input = normalizeExecutePriceAnalysisInput(params);
    await emitProgress(progress, 'Uploading and parsing files...');
    const savedFiles = decodeFiles(input.files);
    await emitProgress(progress, `Successfully uploaded ${String(savedFiles.length)} files.`);

    return await this.priceAnalysisService.analyzePdfFiles({
      files: savedFiles,
      progress,
    });
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

function decodeFiles(
  files: readonly { readonly name: string; readonly content: string }[],
): readonly PriceAnalysisSavedFile[] {
  const savedFiles: PriceAnalysisSavedFile[] = [];

  for (const file of files) {
    const safeName = sanitizeFileName(file.name);

    try {
      const buffer = Buffer.from(file.content, 'base64');
      if (buffer.length === 0) {
        throw new Error('decoded file is empty');
      }

      savedFiles.push({
        name: safeName.length > 0 ? safeName : file.name,
        content: buffer,
      });
    } catch (error) {
      throw new Error(
        `Failed to decode file ${file.name}: ${error instanceof Error ? error.message : 'unknown error'}`,
        {
          cause: error,
        },
      );
    }
  }

  return savedFiles;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_');
}
