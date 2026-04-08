import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PowerSupplyEntity } from '@src/modules/power-system/party-a/power-supply.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem partyA (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let partyARepository: Repository<PartyAEntity>;
  let powerSupplyRepository: Repository<PowerSupplyEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    partyARepository = dataSource.getRepository(PartyAEntity);
    powerSupplyRepository = dataSource.getRepository(PowerSupplyEntity);
  });

  beforeEach(async () => {
    await clearPartyATables();
    await seedPartyAs();
  });

  afterAll(async () => {
    await clearPartyATables();
    if (app) {
      await app.close();
    }
  });

  async function clearPartyATables(): Promise<void> {
    await powerSupplyRepository.createQueryBuilder().delete().execute();
    await partyARepository.createQueryBuilder().delete().execute();
  }

  async function seedPartyAs(): Promise<void> {
    await partyARepository.save([
      partyARepository.create({
        partyAId: 2101,
        companyName: '华东用电科技有限公司',
        creditCode: '913301008888888888',
        companyAddress: '杭州市滨江区江南大道 8 号',
        legalPerson: '张总',
        depositoryBank: '招商银行',
        bankAccountNo: '6225888800000001',
        contactEmail: 'party-a-1@example.com',
        contactPerson: '王工',
        contactPhone: '13811111111',
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyARepository.create({
        partyAId: 2102,
        companyName: '已停用甲方主体',
        creditCode: '913301006666666666',
        companyAddress: '深圳市南山区科技园 10 号',
        legalPerson: '周总',
        depositoryBank: '建设银行',
        bankAccountNo: '6217000000000003',
        contactEmail: 'party-a-2@example.com',
        contactPerson: '吴工',
        contactPhone: '13733333333',
        isActive: false,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await powerSupplyRepository.save([
      powerSupplyRepository.create({
        psId: 3101,
        partyAId: 2101,
        powerSupplyAddress: '杭州市滨江区供电点 A',
        powerSupplyNumber: 'PS-2101-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3102,
        partyAId: 2101,
        powerSupplyAddress: '杭州市滨江区供电点 B',
        powerSupplyNumber: 'PS-2101-B',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3103,
        partyAId: 2102,
        powerSupplyAddress: '深圳市南山区供电点 A',
        powerSupplyNumber: 'PS-2102-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('returns a single active party a by id with nested power supply info', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyA($input: PartyAInput!) {
          partyA(input: $input) {
            partyAId
            companyName
            creditCode
            isActive
            createdBy
            powerSupplyInfo {
              psId
              partyAId
              powerSupplyAddress
              powerSupplyNumber
            }
          }
        }
      `,
      variables: {
        input: {
          partyAId: 2101,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.partyA).toMatchObject({
      partyAId: 2101,
      companyName: '华东用电科技有限公司',
      creditCode: '913301008888888888',
      isActive: true,
      createdBy: 'seed',
    });
    expect(response.body.data.partyA.powerSupplyInfo).toHaveLength(2);
    expect(
      response.body.data.partyA.powerSupplyInfo.map((item: { psId: number }) => item.psId),
    ).toEqual([3101, 3102]);
  });

  it('returns not found when the party a exists but is inactive', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyA($input: PartyAInput!) {
          partyA(input: $input) {
            partyAId
          }
        }
      `,
      variables: {
        input: {
          partyAId: 2102,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('甲方不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.errors[0].extensions.errorCode).toBe('POWER_SYSTEM_PARTY_A_NOT_FOUND');
  });

  it('rejects a non-positive party a id', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyA($input: PartyAInput!) {
          partyA(input: $input) {
            partyAId
          }
        }
      `,
      variables: {
        input: {
          partyAId: 0,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('甲方主体 ID 必须大于 0');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
