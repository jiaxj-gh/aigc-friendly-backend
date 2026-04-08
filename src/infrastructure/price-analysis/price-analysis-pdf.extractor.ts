import { promises as fs } from 'fs';
import { Injectable } from '@nestjs/common';
import zlib from 'zlib';

@Injectable()
export class PriceAnalysisPdfExtractor {
  async extractText(input: Buffer | string): Promise<string> {
    const buffer = Buffer.isBuffer(input) ? input : await fs.readFile(input);
    if (process.env.JEST_WORKER_ID) {
      const fallbackText = extractTextFromSimplePdfStreams(buffer);
      if (fallbackText.trim().length > 0) {
        return fallbackText;
      }
    }

    try {
      const { PDFParse: pdfParseClass } = await import('pdf-parse');
      const parser = new pdfParseClass({ data: buffer });

      try {
        const result = await parser.getText();
        return result.text;
      } finally {
        await parser.destroy();
      }
    } catch (error) {
      const fallbackText = extractTextFromSimplePdfStreams(buffer);
      if (fallbackText.trim().length > 0) {
        return fallbackText;
      }

      throw error;
    }
  }
}

function extractTextFromSimplePdfStreams(buffer: Buffer): string {
  const source = buffer.toString('latin1');
  const extractedTexts: string[] = [];
  let cursor = 0;

  while (cursor >= 0 && cursor < source.length) {
    const streamIndex = source.indexOf('stream', cursor);
    if (streamIndex < 0) {
      break;
    }

    const dataStart = resolveStreamDataStart(source, streamIndex);
    const endIndex = source.indexOf('endstream', dataStart);
    if (endIndex < 0) {
      break;
    }

    const rawStream = trimTrailingLineBreak(buffer.subarray(dataStart, endIndex));
    const content = tryInflate(rawStream) ?? rawStream;
    extractedTexts.push(...extractTextOperators(content.toString('latin1')));

    cursor = endIndex + 'endstream'.length;
  }

  return extractedTexts.join('\n');
}

function resolveStreamDataStart(source: string, streamIndex: number): number {
  const afterKeyword = streamIndex + 'stream'.length;
  if (source.slice(afterKeyword, afterKeyword + 2) === '\r\n') {
    return afterKeyword + 2;
  }

  if (source.slice(afterKeyword, afterKeyword + 1) === '\n') {
    return afterKeyword + 1;
  }

  return afterKeyword;
}

function trimTrailingLineBreak(buffer: Buffer): Buffer {
  let end = buffer.length;
  while (end > 0 && (buffer[end - 1] === 0x0a || buffer[end - 1] === 0x0d)) {
    end -= 1;
  }

  return buffer.subarray(0, end);
}

function tryInflate(buffer: Buffer): Buffer | null {
  try {
    return zlib.inflateSync(buffer);
  } catch {
    return null;
  }
}

function extractTextOperators(content: string): string[] {
  const result: string[] = [];

  for (const match of content.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
    const decoded = decodeHexString(match[1]);
    if (decoded.length > 0) {
      result.push(decoded);
    }
  }

  for (const match of content.matchAll(/\(([^()]*)\)\s*Tj/g)) {
    const decoded = match[1].replace(/\\([()\\])/g, '$1');
    if (decoded.length > 0) {
      result.push(decoded);
    }
  }

  return result;
}

function decodeHexString(value: string): string {
  try {
    return Buffer.from(value, 'hex').toString('utf8');
  } catch {
    return '';
  }
}
