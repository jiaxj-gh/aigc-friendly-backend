import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import ExcelJS from 'exceljs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import WebSocket from 'ws';

interface PriceAnalysisWsMessage {
  readonly status: string;
  readonly step?: string;
  readonly message: string;
  readonly result?: {
    readonly filename: string;
    readonly content: string;
    readonly warnings: readonly string[];
    readonly json_data: readonly unknown[];
  };
}

describe('PowerSystem price-analysis websocket (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as { port: number };
    baseUrl = `ws://127.0.0.1:${String(address.port)}/power-system/price-analysis`;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('streams progress and returns the generated xlsx result', async () => {
    const connection = await connect(baseUrl);
    expect(await connection.collector.next()).toEqual({
      status: 'connected',
      message: 'Connected to Price Analysis Service. Please send files.',
    });

    connection.socket.send(
      JSON.stringify({
        files: [
          {
            name: 'publicity.pdf',
            content: (
              await buildPdf([
                'CENTRAL_BIDDING_PUBLICITY',
                'DATE: 2026-04',
                'monthly_total_same_period: 123.45',
                'reported_monthly_planned_power: 234.56',
                'grid_agent_purchase_power: 12.34',
              ])
            ).toString('base64'),
          },
          {
            name: 'green.pdf',
            content: (
              await buildPdf([
                'GREEN_BILATERAL_RESULT',
                'DATE: 2026-04',
                'traded_energy: 88.80',
                'average_price: 456.70',
              ])
            ).toString('base64'),
          },
        ],
      }),
    );

    const messages = await collectUntilTerminal(connection.collector);
    expect(messages[0]).toEqual({
      status: 'progress',
      step: 'upload',
      message: 'Uploading and parsing files...',
    });
    expect(messages[1]).toEqual({
      status: 'progress',
      step: 'upload_success',
      message: 'Successfully uploaded 2 files.',
    });
    expect(messages.length).toBeGreaterThanOrEqual(3);

    const complete = messages[messages.length - 1];
    expect(complete.status).toBe('complete');
    expect(complete.message).toBe('Analysis complete.');
    expect(complete.result?.filename).toBe('电价分析_2026年04月.xlsx');
    expect(complete.result?.warnings).toEqual([]);
    expect(complete.result?.json_data).toEqual([
      {
        filename: 'publicity.pdf',
        filetype: '电力集中竞价交易公示',
        data: {
          同期月度总电量: 123.45,
          上报月份计划用电: 234.56,
          国网代理采购电量: 12.34,
        },
      },
      {
        filename: 'green.pdf',
        filetype: '绿色双边协商交易结果公示',
        data: {
          成交电量: 88.8,
          交易均价: 456.7,
        },
      },
    ]);

    const workbook = new ExcelJS.Workbook();
    const workbookBytes = Uint8Array.from(Buffer.from(complete.result?.content ?? '', 'base64'));
    await workbook.xlsx.load(workbookBytes as any);
    const worksheet = workbook.worksheets[0];

    expect(worksheet?.getCell('B5').value).toBe(123.45);
    expect(worksheet?.getCell('E5').value).toBe(234.56);
    expect(worksheet?.getCell('G5').value).toBe(12.34);
    expect(worksheet?.getCell('AT5').value).toBe(88.8);
    expect(worksheet?.getCell('AU5').value).toBe(456.7);

    connection.collector.stop();
    connection.socket.terminate();
  });

  it('returns an error when no files are provided', async () => {
    const connection = await connect(baseUrl);
    await connection.collector.next();

    connection.socket.send(JSON.stringify({}));
    expect(await connection.collector.next()).toEqual({
      status: 'error',
      message: 'No files provided.',
    });

    connection.collector.stop();
    connection.socket.terminate();
  });

  it('returns an error for invalid json payloads', async () => {
    const connection = await connect(baseUrl);
    await connection.collector.next();

    connection.socket.send('not-json');
    expect(await connection.collector.next()).toEqual({
      status: 'error',
      message: 'Invalid JSON payload.',
    });

    connection.collector.stop();
    connection.socket.terminate();
  });
});

async function connect(url: string): Promise<{
  socket: WebSocket;
  collector: ReturnType<typeof createMessageCollector>;
}> {
  const socket = new WebSocket(url);
  const collector = createMessageCollector(socket);
  return await new Promise<{
    socket: WebSocket;
    collector: ReturnType<typeof createMessageCollector>;
  }>((resolve, reject) => {
    socket.once('open', () => resolve({ socket, collector }));
    socket.once('error', (error) => reject(error));
  });
}

async function collectUntilTerminal(
  collector: ReturnType<typeof createMessageCollector>,
): Promise<PriceAnalysisWsMessage[]> {
  const messages: PriceAnalysisWsMessage[] = [];

  while (true) {
    const message = await collector.next();
    messages.push(message);

    if (message.status === 'complete' || message.status === 'error') {
      return messages;
    }
  }
}

async function buildPdf(lines: readonly string[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let currentY = 800;
  for (const line of lines) {
    page.drawText(line, {
      x: 40,
      y: currentY,
      size: 12,
      font,
    });
    currentY -= 18;
  }

  return Buffer.from(await pdfDoc.save());
}

function createMessageCollector(socket: WebSocket): {
  next: () => Promise<PriceAnalysisWsMessage>;
  stop: () => void;
} {
  const queue: PriceAnalysisWsMessage[] = [];
  let resolver: ((message: PriceAnalysisWsMessage) => void) | null = null;

  const handleMessage = (data: Buffer | string) => {
    const message = JSON.parse(data.toString()) as PriceAnalysisWsMessage;
    if (resolver) {
      const currentResolver = resolver;
      resolver = null;
      currentResolver(message);
      return;
    }

    queue.push(message);
  };

  socket.on('message', handleMessage);

  return {
    next: async () => {
      if (queue.length > 0) {
        return queue.shift()!;
      }

      return await new Promise<PriceAnalysisWsMessage>((resolve) => {
        resolver = resolve;
      });
    },
    stop: () => {
      socket.off('message', handleMessage);
    },
  };
}
