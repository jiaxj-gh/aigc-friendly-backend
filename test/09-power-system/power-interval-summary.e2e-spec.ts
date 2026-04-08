import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ActualPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/actual-power-consumption.entity';
import { ForecastPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/forecast-power-consumption.entity';
import { postGql } from '../utils/e2e-graphql-utils';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem powerIntervalSummary (e2e)', () => {
  let app: INestApplication;
  let actualRepository: Repository<ActualPowerConsumptionEntity>;
  let forecastRepository: Repository<ForecastPowerConsumptionEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    actualRepository = dataSource.getRepository(ActualPowerConsumptionEntity);
    forecastRepository = dataSource.getRepository(ForecastPowerConsumptionEntity);
  });

  beforeEach(async () => {
    await forecastRepository.clear();
    await actualRepository.clear();
  });

  afterAll(async () => {
    await forecastRepository.clear();
    await actualRepository.clear();
    if (app) {
      await app.close();
    }
  });

  it('returns 15-minute actual and forecast points for a supported company', async () => {
    await actualRepository.save([
      createActualSeed(actualRepository, {
        sellerCompanyName: '售电甲',
        retailUserName: '苏州三星电子有限公司',
        recordDate: '2026-04-01',
        accountNumber: 'ACT-INT-001',
        consumption0015: 10,
        consumption0030: 20,
        consumption2400: 1,
      }),
      createActualSeed(actualRepository, {
        sellerCompanyName: '售电乙',
        retailUserName: '苏州三星电子有限公司',
        recordDate: '2026-04-01',
        accountNumber: 'ACT-INT-002',
        consumption0015: 3,
      }),
    ]);

    await forecastRepository.save([
      createForecastSeed(forecastRepository, {
        sellerCompanyName: '售电甲',
        retailUserName: '苏州三星电子有限公司',
        recordDate: '2026-04-01',
        useDate: '20260318-20260331',
        consumption0015: 12,
        consumption0030: 18,
        consumption2400: 2,
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerIntervalSummary($input: PowerIntervalSummaryInput!) {
          powerIntervalSummary(input: $input) {
            companyName
            startDate
            endDate
            needUpload
            forecastReport
            points {
              timestamp
              actualEnergyKwh
              forecastEnergyKwh
            }
          }
        }
      `,
      variables: {
        input: {
          companyName: '苏州三星电子有限公司',
          startDate: '2026-04-01',
          endDate: '2026-04-01',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerIntervalSummary.companyName).toBe('苏州三星电子有限公司');
    expect(response.body.data.powerIntervalSummary.startDate).toBe('2026-04-01');
    expect(response.body.data.powerIntervalSummary.endDate).toBe('2026-04-01');
    expect(response.body.data.powerIntervalSummary.needUpload).toBe(false);
    expect(response.body.data.powerIntervalSummary.forecastReport).toBe(
      '苏州三星电子有限公司缺失预测日期为：\n待补充实际数据日期为：\n',
    );
    expect(response.body.data.powerIntervalSummary.points).toHaveLength(96);
    expect(response.body.data.powerIntervalSummary.points[0]).toEqual({
      timestamp: '2026-04-01T00:15:00.000Z',
      actualEnergyKwh: 13,
      forecastEnergyKwh: 12,
    });
    expect(response.body.data.powerIntervalSummary.points[1]).toEqual({
      timestamp: '2026-04-01T00:30:00.000Z',
      actualEnergyKwh: 20,
      forecastEnergyKwh: 18,
    });
    expect(response.body.data.powerIntervalSummary.points[95]).toEqual({
      timestamp: '2026-04-02T00:00:00.000Z',
      actualEnergyKwh: 1,
      forecastEnergyKwh: 2,
    });
  });

  it('returns unsupported-model report for a company outside the supported list', async () => {
    await actualRepository.save([
      createActualSeed(actualRepository, {
        sellerCompanyName: '售电甲',
        retailUserName: '火星测试能源公司',
        recordDate: '2026-04-01',
        accountNumber: 'ACT-INT-101',
        consumption0015: 5,
      }),
    ]);

    await forecastRepository.save([
      createForecastSeed(forecastRepository, {
        sellerCompanyName: '售电甲',
        retailUserName: '火星测试能源公司',
        recordDate: '2026-04-01',
        useDate: '20260318-20260331',
        consumption0015: 6,
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerIntervalSummary($input: PowerIntervalSummaryInput!) {
          powerIntervalSummary(input: $input) {
            needUpload
            forecastReport
          }
        }
      `,
      variables: {
        input: {
          companyName: '火星测试能源公司',
          startDate: '2026-04-01',
          endDate: '2026-04-01',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerIntervalSummary).toEqual({
      needUpload: false,
      forecastReport: '当前预测模型不支持此公司：火星测试能源公司',
    });
  });

  it('preserves the legacy all-companies missing-forecast semantics', async () => {
    await actualRepository.save([
      createActualSeed(actualRepository, {
        sellerCompanyName: '售电甲',
        retailUserName: '苏州三星电子有限公司',
        recordDate: '2026-04-01',
        accountNumber: 'ACT-INT-201',
        consumption0015: 8,
      }),
    ]);

    await forecastRepository.save([
      createForecastSeed(forecastRepository, {
        sellerCompanyName: '售电甲',
        retailUserName: '苏州三星电子有限公司',
        recordDate: '2026-04-01',
        useDate: '20260318-20260331',
        consumption0015: 9,
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerIntervalSummary($input: PowerIntervalSummaryInput!) {
          powerIntervalSummary(input: $input) {
            needUpload
            forecastReport
          }
        }
      `,
      variables: {
        input: {
          companyName: '--全部--',
          startDate: '2026-04-01',
          endDate: '2026-04-01',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerIntervalSummary.needUpload).toBe(true);
    expect(response.body.data.powerIntervalSummary.forecastReport).toContain(
      '--全部--缺失预测日期为：2026-04-01',
    );
    expect(response.body.data.powerIntervalSummary.forecastReport).toContain(
      '待补充实际数据日期为：',
    );
    expect(response.body.data.powerIntervalSummary.forecastReport).toContain('2026-03-18');
  });

  it('returns an empty payload with upload hint when there is no data in the range', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerIntervalSummary($input: PowerIntervalSummaryInput!) {
          powerIntervalSummary(input: $input) {
            companyName
            points {
              timestamp
            }
            needUpload
            forecastReport
          }
        }
      `,
      variables: {
        input: {
          companyName: '苏州三星电子有限公司',
          startDate: '2026-04-01',
          endDate: '2026-04-02',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerIntervalSummary).toEqual({
      companyName: '苏州三星电子有限公司',
      points: [],
      needUpload: true,
      forecastReport: '当前时间段无任何数据',
    });
  });

  it('rejects an inverted date range', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerIntervalSummary($input: PowerIntervalSummaryInput!) {
          powerIntervalSummary(input: $input) {
            companyName
          }
        }
      `,
      variables: {
        input: {
          companyName: '--全部--',
          startDate: '2026-04-03',
          endDate: '2026-04-01',
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('起始日期不能晚于终止日期');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});

function createActualSeed(
  repository: Repository<ActualPowerConsumptionEntity>,
  params: {
    readonly sellerCompanyName: string;
    readonly retailUserName: string;
    readonly recordDate: string;
    readonly accountNumber: string;
    readonly consumption0015?: number;
    readonly consumption0030?: number;
    readonly consumption2400?: number;
  },
): ActualPowerConsumptionEntity {
  return Object.assign(
    repository.create({
      sellerCompanyName: params.sellerCompanyName,
      retailUserName: params.retailUserName,
      recordDate: params.recordDate,
      accountNumber: params.accountNumber,
      dailyTotalEnergyKwh: null,
      createdBy: 'seed',
      updatedBy: 'seed',
    }),
    {
      consumption0015: params.consumption0015 ?? null,
      consumption0030: params.consumption0030 ?? null,
      consumption2400: params.consumption2400 ?? null,
    },
  );
}

function createForecastSeed(
  repository: Repository<ForecastPowerConsumptionEntity>,
  params: {
    readonly sellerCompanyName: string;
    readonly retailUserName: string;
    readonly recordDate: string;
    readonly useDate: string;
    readonly consumption0015?: number;
    readonly consumption0030?: number;
    readonly consumption2400?: number;
  },
): ForecastPowerConsumptionEntity {
  return Object.assign(
    repository.create({
      sellerCompanyName: params.sellerCompanyName,
      retailUserName: params.retailUserName,
      recordDate: params.recordDate,
      useDate: params.useDate,
      dailyTotalEnergyKwh: null,
      createdBy: 'seed',
      updatedBy: 'seed',
    }),
    {
      consumption0015: params.consumption0015 ?? null,
      consumption0030: params.consumption0030 ?? null,
      consumption2400: params.consumption2400 ?? null,
    },
  );
}
