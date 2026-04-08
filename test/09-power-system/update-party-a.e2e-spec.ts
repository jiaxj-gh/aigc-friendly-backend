import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PowerSupplyEntity } from '@src/modules/power-system/party-a/power-supply.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem updatePartyA (e2e)', () => {
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
        partyAId: 2201,
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
        partyAId: 2202,
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
        psId: 3201,
        partyAId: 2201,
        powerSupplyAddress: '杭州市滨江区供电点 A',
        powerSupplyNumber: 'PS-2201-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3202,
        partyAId: 2201,
        powerSupplyAddress: '杭州市滨江区供电点 B',
        powerSupplyNumber: 'PS-2201-B',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3203,
        partyAId: 2202,
        powerSupplyAddress: '深圳市南山区供电点 A',
        powerSupplyNumber: 'PS-2202-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('updates an active party a and fully replaces power supply info when provided', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdatePartyA($input: UpdatePartyAInput!) {
          updatePartyA(input: $input) {
            partyAId
            companyName
            contactPerson
            contactPhone
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
          partyAId: 2201,
          companyName: '华东用电科技集团有限公司',
          contactPerson: null,
          contactPhone: '13666666666',
          powerSupplyInfo: [
            {
              powerSupplyAddress: '杭州市滨江区新供电点 A',
              powerSupplyNumber: 'PS-2201-C',
            },
          ],
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePartyA).toMatchObject({
      partyAId: 2201,
      companyName: '华东用电科技集团有限公司',
      contactPerson: null,
      contactPhone: '13666666666',
      updatedBy: 'admin',
    });
    expect(response.body.data.updatePartyA.powerSupplyInfo).toHaveLength(1);
    expect(response.body.data.updatePartyA.powerSupplyInfo[0]).toMatchObject({
      partyAId: 2201,
      powerSupplyAddress: '杭州市滨江区新供电点 A',
      powerSupplyNumber: 'PS-2201-C',
    });

    const persisted = await partyARepository.findOneBy({ partyAId: 2201 });
    expect(persisted?.companyName).toBe('华东用电科技集团有限公司');
    expect(persisted?.contactPerson).toBeNull();
    expect(persisted?.updatedBy).toBe('admin');

    const persistedPowerSupplies = await powerSupplyRepository.find({
      where: { partyAId: 2201 },
      order: { psId: 'ASC' },
    });
    expect(persistedPowerSupplies).toHaveLength(1);
    expect(persistedPowerSupplies[0]?.powerSupplyNumber).toBe('PS-2201-C');
  });

  it('returns not found when the party a exists but is inactive', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdatePartyA($input: UpdatePartyAInput!) {
          updatePartyA(input: $input) {
            partyAId
          }
        }
      `,
      variables: {
        input: {
          partyAId: 2202,
          companyName: '不会成功',
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('甲方不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.errors[0].extensions.errorCode).toBe('POWER_SYSTEM_PARTY_A_NOT_FOUND');
  });

  it('rejects an overlong contact phone', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdatePartyA($input: UpdatePartyAInput!) {
          updatePartyA(input: $input) {
            partyAId
          }
        }
      `,
      variables: {
        input: {
          partyAId: 2201,
          contactPhone: '1'.repeat(31),
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('联系电话长度不能超过 30');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
