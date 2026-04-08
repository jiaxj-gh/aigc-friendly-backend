import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PowerSupplyEntity } from '@src/modules/power-system/party-a/power-supply.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem createPartyA (e2e)', () => {
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

  it('creates a new active party a with nested power supply info and system audit fields', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreatePartyA($input: CreatePartyAInput!) {
          createPartyA(input: $input) {
            partyAId
            companyName
            creditCode
            isActive
            createdBy
            updatedBy
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
          companyName: '华中新能源用电有限公司',
          creditCode: '913301005555555551',
          companyAddress: '武汉市东湖高新区光谷大道 66 号',
          legalPerson: '张三',
          depositoryBank: '农业银行',
          bankAccountNo: '6228488888888888',
          contactEmail: 'party-a-new@example.com',
          contactPerson: '李四',
          contactPhone: '13500000000',
          powerSupplyInfo: [
            {
              powerSupplyAddress: '武汉市东湖高新区供电点 A',
              powerSupplyNumber: 'PS-NEW-A',
            },
            {
              powerSupplyAddress: '武汉市东湖高新区供电点 B',
              powerSupplyNumber: 'PS-NEW-B',
            },
          ],
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createPartyA).toMatchObject({
      companyName: '华中新能源用电有限公司',
      creditCode: '913301005555555551',
      isActive: true,
      createdBy: 'admin',
      updatedBy: 'admin',
    });
    expect(response.body.data.createPartyA.partyAId).toBeGreaterThan(0);
    expect(response.body.data.createPartyA.powerSupplyInfo).toHaveLength(2);

    const persistedPartyA = await partyARepository.findOneBy({
      partyAId: response.body.data.createPartyA.partyAId,
    });
    expect(persistedPartyA).not.toBeNull();
    expect(persistedPartyA?.isActive).toBe(true);
    expect(persistedPartyA?.createdBy).toBe('admin');

    const persistedPowerSupplies = await powerSupplyRepository.find({
      where: { partyAId: response.body.data.createPartyA.partyAId },
      order: { psId: 'ASC' },
    });
    expect(persistedPowerSupplies).toHaveLength(2);
    expect(persistedPowerSupplies.map((item) => item.powerSupplyNumber)).toEqual([
      'PS-NEW-A',
      'PS-NEW-B',
    ]);
  });

  it('rejects a whitespace-only company name via usecase normalization', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreatePartyA($input: CreatePartyAInput!) {
          createPartyA(input: $input) {
            partyAId
          }
        }
      `,
      variables: {
        input: {
          companyName: '   ',
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('公司名称 不能为空');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('rejects an overlong power supply address', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreatePartyA($input: CreatePartyAInput!) {
          createPartyA(input: $input) {
            partyAId
          }
        }
      `,
      variables: {
        input: {
          companyName: '华中新能源用电有限公司',
          powerSupplyInfo: [
            {
              powerSupplyAddress: 'A'.repeat(256),
              powerSupplyNumber: 'PS-NEW-A',
            },
          ],
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('供电地址长度不能超过 255');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
