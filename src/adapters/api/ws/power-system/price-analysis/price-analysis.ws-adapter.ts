import { DomainError } from '@core/common/errors/domain-error';
import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExecutePriceAnalysisUsecase } from '@usecases/power-system/price-analysis/execute-price-analysis.usecase';
import type { IncomingMessage, Server } from 'http';
import type { Duplex } from 'stream';
import { URL } from 'url';
import { WebSocket, WebSocketServer, type RawData } from 'ws';

@Injectable()
export class PowerSystemPriceAnalysisWsAdapter implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly webSocketServer = new WebSocketServer({ noServer: true });
  private readonly upgradeHandler = this.handleUpgrade.bind(this);
  private attached = false;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly executePriceAnalysisUsecase: ExecutePriceAnalysisUsecase,
  ) {}

  onApplicationBootstrap(): void {
    if (this.attached) {
      return;
    }

    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer() as Server | undefined;
    if (!httpServer) {
      return;
    }

    this.webSocketServer.on('connection', (socket: WebSocket) => {
      void this.handleConnection(socket);
    });
    httpServer.on('upgrade', this.upgradeHandler);
    this.attached = true;
  }

  onModuleDestroy(): void {
    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer() as Server | undefined;
    if (httpServer && this.attached) {
      httpServer.off('upgrade', this.upgradeHandler);
      this.attached = false;
    }

    this.webSocketServer.close();
  }

  private handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    const requestUrl = request.url ?? '';
    const pathname = new URL(requestUrl, 'http://127.0.0.1').pathname;
    if (pathname !== '/power-system/price-analysis') {
      return;
    }

    this.webSocketServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      this.webSocketServer.emit('connection', ws, request);
    });
  }

  private async handleConnection(socket: WebSocket): Promise<void> {
    await sendJson(socket, {
      status: 'connected',
      message: 'Connected to Price Analysis Service. Please send files.',
    });

    socket.once('message', (data: RawData, isBinary: boolean) => {
      void this.handleMessage(socket, data, isBinary);
    });
  }

  private async handleMessage(socket: WebSocket, data: RawData, isBinary: boolean): Promise<void> {
    if (isBinary) {
      await sendJson(socket, {
        status: 'error',
        message: 'Invalid JSON payload.',
      });
      return;
    }

    try {
      const payload = parseWsPayload(data);
      const result = await this.executePriceAnalysisUsecase.execute(payload, async (message) => {
        await sendJson(socket, {
          status: 'progress',
          step: mapProgressStep(message),
          message,
        });
      });

      await sendJson(socket, {
        status: 'complete',
        message: 'Analysis complete.',
        result: {
          filename: result.filename,
          content: result.content.toString('base64'),
          warnings: result.warnings,
          json_data: result.jsonData,
        },
      });
    } catch (error) {
      await sendJson(socket, {
        status: 'error',
        message: mapErrorMessage(error),
      });
    }
  }
}

function rawDataToString(data: RawData): string {
  if (typeof data === 'string') {
    return data;
  }

  if (Buffer.isBuffer(data)) {
    return data.toString('utf8');
  }

  if (Array.isArray(data)) {
    return Buffer.concat(data).toString('utf8');
  }

  return Buffer.from(data).toString('utf8');
}

function parseWsPayload(data: RawData): { readonly files?: unknown } {
  try {
    return JSON.parse(rawDataToString(data)) as { readonly files?: unknown };
  } catch {
    throw new Error('Invalid JSON payload.');
  }
}

function mapProgressStep(message: string): string {
  if (message === 'Uploading and parsing files...') {
    return 'upload';
  }

  if (/Successfully uploaded \d+ files\./.test(message)) {
    return 'upload_success';
  }

  if (message.includes('提取详细数据')) {
    return 'extraction';
  }

  if (message.includes('填充Excel')) {
    return 'excel_generation';
  }

  return 'processing';
}

function mapErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

async function sendJson(socket: WebSocket, payload: unknown): Promise<void> {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    socket.send(JSON.stringify(payload), (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
