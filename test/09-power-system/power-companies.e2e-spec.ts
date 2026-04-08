import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ActualPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/actual-power-consumption.entity';
import { postGql } from '../utils/e2e-graphql-utils';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem powerCompanies (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let actualPowerConsumptionRepository: Repository<ActualPowerConsumptionEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    actualPowerConsumptionRepository = dataSource.getRepository(ActualPowerConsumptionEntity);
  });

  beforeEach(async () => {
    await actualPowerConsumptionRepository.clear();
  });

  afterAll(async () => {
    await actualPowerConsumptionRepository.clear();
    if (app) {
      await app.close();
    }
  });

  it('returns sorted distinct company names with the all option first', async () => {
    await actualPowerConsumptionRepository.save([
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: '杭州未来科技有限公司',
        recordDate: '2026-03-01',
        accountNumber: 'ACC-001',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: '杭州未来科技有限公司',
        recordDate: '2026-03-02',
        accountNumber: 'ACC-001',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电乙',
        retailUserName: '上海临港能源有限公司',
        recordDate: '2026-03-01',
        accountNumber: 'ACC-002',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电乙',
        retailUserName: null,
        recordDate: '2026-03-03',
        accountNumber: 'ACC-003',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电丙',
        retailUserName: '   ',
        recordDate: '2026-03-04',
        accountNumber: 'ACC-004',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerCompanies {
          powerCompanies
        }
      `,
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerCompanies).toEqual([
      '--全部--',
      '杭州未来科技有限公司',
      '上海临港能源有限公司',
    ]);
  });

  it('returns only the all option when there is no usable company name', async () => {
    await actualPowerConsumptionRepository.save([
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电甲',
        retailUserName: null,
        recordDate: '2026-03-01',
        accountNumber: 'ACC-101',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      actualPowerConsumptionRepository.create({
        sellerCompanyName: '售电乙',
        retailUserName: '   ',
        recordDate: '2026-03-02',
        accountNumber: 'ACC-102',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerCompanies {
          powerCompanies
        }
      `,
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerCompanies).toEqual(['--全部--']);
  });
});
