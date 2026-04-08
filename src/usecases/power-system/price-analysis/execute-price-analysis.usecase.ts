import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
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
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'power-price-analysis-'));

    try {
      await emitProgress(progress, 'Uploading and parsing files...');
      const savedFiles = await saveFiles(tempDir, input.files);
      await emitProgress(progress, `Successfully uploaded ${String(savedFiles.length)} files.`);

      return await this.priceAnalysisService.analyzePdfFiles({
        files: savedFiles,
        progress,
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
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

async function saveFiles(
  tempDir: string,
  files: readonly { readonly name: string; readonly content: string }[],
): Promise<readonly PriceAnalysisSavedFile[]> {
  const savedFiles: PriceAnalysisSavedFile[] = [];

  for (const file of files) {
    const filePath = path.join(tempDir, sanitizeFileName(file.name));

    try {
      const buffer = Buffer.from(file.content, 'base64');
      if (buffer.length === 0) {
        throw new Error('decoded file is empty');
      }

      await fs.writeFile(filePath, buffer);
      savedFiles.push({
        name: file.name,
        path: filePath,
      });
    } catch (error) {
      throw new Error(
        `Failed to save file ${file.name}: ${error instanceof Error ? error.message : 'unknown error'}`,
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
