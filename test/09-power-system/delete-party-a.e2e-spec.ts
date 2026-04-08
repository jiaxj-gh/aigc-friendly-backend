import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PowerSupplyEntity } from '@src/modules/power-system/party-a/power-supply.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem deletePartyA (e2e)', () => {
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
        partyAId: 2301,
        companyName: '待删除甲方主体',
        creditCode: '913301003333333333',
        companyAddress: '杭州市滨江区删除路 1 号',
        legalPerson: '原法人',
        depositoryBank: '招商银行',
        bankAccountNo: '6225888800000001',
        contactEmail: 'party-a-delete@example.com',
        contactPerson: '原联系人',
        contactPhone: '13811111111',
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyARepository.create({
        partyAId: 2302,
        companyName: '已停用甲方主体',
        creditCode: '913301004444444444',
        companyAddress: '深圳市南山区停用路 2 号',
        legalPerson: '停用法人',
        depositoryBank: '建设银行',
        bankAccountNo: '6217000000000003',
        contactEmail: 'party-a-inactive@example.com',
        contactPerson: '停用联系人',
        contactPhone: '13733333333',
        isActive: false,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await powerSupplyRepository.save([
      powerSupplyRepository.create({
        psId: 3301,
        partyAId: 2301,
        powerSupplyAddress: '杭州市滨江区供电点 A',
        powerSupplyNumber: 'PS-2301-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3302,
        partyAId: 2302,
        powerSupplyAddress: '深圳市南山区供电点 A',
        powerSupplyNumber: 'PS-2302-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('soft deletes an active party a', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeletePartyA($input: DeletePartyAInput!) {
          deletePartyA(input: $input)
        }
      `,
      variables: {
        input: {
          partyAId: 2301,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deletePartyA).toBe(true);

    const persisted = await partyARepository.findOneBy({ partyAId: 2301 });
    expect(persisted).not.toBeNull();
    expect(persisted?.isActive).toBe(false);
    expect(persisted?.updatedBy).toBe('seed');
  });

  it('returns not found when the party a exists but is already inactive', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeletePartyA($input: DeletePartyAInput!) {
          deletePartyA(input: $input)
        }
      `,
      variables: {
        input: {
          partyAId: 2302,
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
        mutation DeletePartyA($input: DeletePartyAInput!) {
          deletePartyA(input: $input)
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
