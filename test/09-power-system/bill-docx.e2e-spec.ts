import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import PizZip from 'pizzip';
import request from 'supertest';
import { App } from 'supertest/types';

describe('PowerSystem bill docx (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const binaryParser = (
    res: NodeJS.ReadableStream & {
      setEncoding(encoding: BufferEncoding): void;
    },
    callback: (error: Error | null, body: Buffer) => void,
  ): void => {
    const chunks: Buffer[] = [];
    res.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'binary') : chunk);
    });
    res.on('end', () => {
      callback(null, Buffer.concat(chunks));
    });
    res.on('error', (error: Error) => {
      callback(error, Buffer.alloc(0));
    });
  };

  const parseHttpJson = (response: request.Response): Record<string, unknown> => {
    if (response.body && Object.keys(response.body).length > 0) {
      return response.body as Record<string, unknown>;
    }
    return JSON.parse(response.text) as Record<string, unknown>;
  };

  const getDocumentXml = (buffer: Buffer): string => {
    const zip = new PizZip(buffer);
    return zip.file('word/document.xml')?.asText() ?? '';
  };

  it('downloads a bill docx attachment', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/bills/docx')
      .send({
        partyAName: '杭州云测能源科技有限公司',
        quotaInfo: [
          {
            quotaPrice: '0.4800',
            quotaType: '固定价格',
          },
          {
            quotaPrice: '0.5200',
            quotaType: '价差浮动',
          },
        ],
      })
      .buffer(true)
      .parse(
        binaryParser as unknown as (
          res: unknown,
          callback: (error: Error | null, body: unknown) => void,
        ) => void,
      )
      .expect(200);

    expect(response.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(response.headers['content-disposition']).toMatch(
      /^attachment; filename\*=UTF-8''bill_.+_\d{8}_\d{6}\.docx$/,
    );
    expect(Number(response.headers['content-length'])).toBe(response.body.length);
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(1024);
    expect(response.body.subarray(0, 2).toString('utf8')).toBe('PK');

    const documentXml = getDocumentXml(response.body);
    expect(documentXml).toContain('杭州云测能源科技有限公司');
    expect(documentXml).toContain('0.4800');
    expect(documentXml).toContain('固定价格');
    expect(documentXml).toContain('0.5200');
    expect(documentXml).toContain('价差浮动');
    expect(documentXml).not.toContain('{party_a_company_name}');
    expect(documentXml).not.toContain('{quota_price}');
  });

  it('returns bad request when quota info is not an array', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/bills/docx')
      .send({
        partyAName: '杭州云测能源科技有限公司',
        quotaInfo: {
          quotaPrice: '0.4800',
          quotaType: '固定价格',
        },
      })
      .expect(400);

    const body = parseHttpJson(response);
    expect(body.errorCode).toBe('INPUT_NORMALIZE_INVALID_TEXT_LIST');
    expect(body.message).toBe('quotaInfo 必须是数组');
  });

  it('returns bad request when a quota item is not an object', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/bills/docx')
      .send({
        partyAName: '杭州云测能源科技有限公司',
        quotaInfo: ['固定价格'],
      })
      .expect(400);

    const body = parseHttpJson(response);
    expect(body.errorCode).toBe('INPUT_NORMALIZE_INVALID_TEXT_LIST_ITEM');
    expect(body.message).toBe('quotaInfo[0] 必须是对象');
  });
});
