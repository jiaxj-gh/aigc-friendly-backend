import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ActualPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/actual-power-consumption.entity';
import { ForecastPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/forecast-power-consumption.entity';
import { postGql } from '../utils/e2e-graphql-utils';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem powerDailySummary (e2e)', () => {
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

  it('returns daily actual and forecast summary for all companies within a date range', async () => {
    await actualRepository.save([
      actualRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: '杭州未来科技有限公司',
        recordDate: '2026-04-01',
        accountNumber: 'ACT-001',
        dailyTotalEnergyKwh: 120,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualRepository.create({
        sellerCompanyName: '售电乙',
        retailUserName: '上海临港能源有限公司',
        recordDate: '2026-04-01',
        accountNumber: 'ACT-002',
        dailyTotalEnergyKwh: 80,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: '杭州未来科技有限公司',
        recordDate: '2026-04-02',
        accountNumber: 'ACT-003',
        dailyTotalEnergyKwh: 150,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await forecastRepository.save([
      forecastRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: '杭州未来科技有限公司',
        recordDate: '2026-04-01',
        useDate: '20260320-20260330',
        dailyTotalEnergyKwh: 220,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      forecastRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: '杭州未来科技有限公司',
        recordDate: '2026-04-02',
        useDate: '20260321-20260331',
        dailyTotalEnergyKwh: 180,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      forecastRepository.create({
        sellerCompanyName: '售电乙',
        retailUserName: '上海临港能源有限公司',
        recordDate: '2026-04-02',
        useDate: '20260321-20260331',
        dailyTotalEnergyKwh: 70,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerDailySummary($input: PowerDailySummaryInput!) {
          powerDailySummary(input: $input) {
            companyName
            startDate
            endDate
            days {
              summaryDate
              actualEnergyKwh
              forecastEnergyKwh
              forecastDeviation
            }
          }
        }
      `,
      variables: {
        input: {
          companyName: '--全部--',
          startDate: '2026-04-01',
          endDate: '2026-04-03',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerDailySummary).toEqual({
      companyName: '--全部--',
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      days: [
        {
          summaryDate: '2026-04-01',
          actualEnergyKwh: 200,
          forecastEnergyKwh: 220,
          forecastDeviation: ((220 - 200) / 220) * 100,
        },
        {
          summaryDate: '2026-04-02',
          actualEnergyKwh: 150,
          forecastEnergyKwh: 250,
          forecastDeviation: ((250 - 150) / 250) * 100,
        },
        {
          summaryDate: '2026-04-03',
          actualEnergyKwh: null,
          forecastEnergyKwh: null,
          forecastDeviation: null,
        },
      ],
    });
  });

  it('returns date-filled empty summary when no rows match the company and range', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerDailySummary($input: PowerDailySummaryInput!) {
          powerDailySummary(input: $input) {
            companyName
            days {
              summaryDate
              actualEnergyKwh
              forecastEnergyKwh
              forecastDeviation
            }
          }
        }
      `,
      variables: {
        input: {
          companyName: '不存在的企业',
          startDate: '2026-04-01',
          endDate: '2026-04-02',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerDailySummary).toEqual({
      companyName: '不存在的企业',
      days: [
        {
          summaryDate: '2026-04-01',
          actualEnergyKwh: null,
          forecastEnergyKwh: null,
          forecastDeviation: null,
        },
        {
          summaryDate: '2026-04-02',
          actualEnergyKwh: null,
          forecastEnergyKwh: null,
          forecastDeviation: null,
        },
      ],
    });
  });

  it('rejects an inverted date range', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerDailySummary($input: PowerDailySummaryInput!) {
          powerDailySummary(input: $input) {
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
