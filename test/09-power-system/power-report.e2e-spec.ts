import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ForecastPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/forecast-power-consumption.entity';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem power report (e2e)', () => {
  let app: INestApplication<App>;
  let forecastPowerConsumptionRepository: Repository<ForecastPowerConsumptionEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    forecastPowerConsumptionRepository = dataSource.getRepository(ForecastPowerConsumptionEntity);
  });

  beforeEach(async () => {
    await forecastPowerConsumptionRepository.createQueryBuilder().delete().execute();
  });

  afterAll(async () => {
    await forecastPowerConsumptionRepository.createQueryBuilder().delete().execute();
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

  it('downloads a forecast report csv attachment', async () => {
    const firstRow = forecastPowerConsumptionRepository.create({
      sellerCompanyName: '测试售电公司',
      retailUserName: '苏州三星电子有限公司',
      recordDate: '2026-04-10',
      useDate: '2026-04-01~2026-04-10',
      dailyTotalEnergyKwh: 3.75,
      createdBy: 'seed',
      updatedBy: 'seed',
    });
    Object.assign(firstRow as unknown as Record<string, unknown>, {
      consumption0015: 1.25,
      consumption0030: 2.5,
    });

    const secondRow = forecastPowerConsumptionRepository.create({
      sellerCompanyName: '测试售电公司',
      retailUserName: '苏州三星电子有限公司',
      recordDate: '2026-04-11',
      useDate: '2026-04-02~2026-04-11',
      dailyTotalEnergyKwh: 2,
      createdBy: 'seed',
      updatedBy: 'seed',
    });
    Object.assign(secondRow as unknown as Record<string, unknown>, {
      consumption0015: 2,
    });

    await forecastPowerConsumptionRepository.save([firstRow, secondRow]);

    const response = await request(app.getHttpServer())
      .get('/power-system/power-consumption/report')
      .query({
        companyName: '苏州三星电子有限公司',
        startDate: '2026-04-10',
        endDate: '2026-04-11',
      })
      .buffer(true)
      .parse(
        binaryParser as unknown as (
          res: unknown,
          callback: (error: Error | null, body: unknown) => void,
        ) => void,
      )
      .expect(200);

    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toMatch(
      /^attachment; filename\*=UTF-8''forecast_report_.+_\d{8}_\d{6}\.csv$/,
    );
    expect(Number(response.headers['content-length'])).toBe(response.body.length);
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]));

    const csvText = response.body.toString('utf8');
    expect(csvText).toContain('公司名称,日期,00:15,00:30');
    expect(csvText).toContain('苏州三星电子有限公司,2026-04-10,1.25,2.5');
    expect(csvText).toContain('苏州三星电子有限公司,2026-04-11,2,');
  });

  it('returns not found when the forecast report has no rows', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-system/power-consumption/report')
      .query({
        companyName: '苏州三星电子有限公司',
        startDate: '2026-04-10',
        endDate: '2026-04-11',
      })
      .expect(404);

    const body = parseHttpJson(response);
    expect(body.errorCode).toBe('POWER_SYSTEM_REPORT_NOT_FOUND');
    expect(body.message).toBe('当前预测数据不存在');
  });

  it('returns bad request when date range is reversed', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-system/power-consumption/report')
      .query({
        companyName: '苏州三星电子有限公司',
        startDate: '2026-04-12',
        endDate: '2026-04-11',
      })
      .expect(400);

    const body = parseHttpJson(response);
    expect(body.errorCode).toBe('TIME_INVALID_TIME_RANGE_ORDER');
    expect(body.message).toBe('起始日期不能晚于终止日期');
  });
});
