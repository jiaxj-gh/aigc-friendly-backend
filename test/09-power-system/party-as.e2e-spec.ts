import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PowerSupplyEntity } from '@src/modules/power-system/party-a/power-supply.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem partyAs (e2e)', () => {
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
        partyAId: 2001,
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
        partyAId: 2002,
        companyName: '华北工业能源有限公司',
        creditCode: '913301007777777777',
        companyAddress: '北京市海淀区中关村大街 9 号',
        legalPerson: '李总',
        depositoryBank: '工商银行',
        bankAccountNo: '6222000000000002',
        contactEmail: 'party-a-2@example.com',
        contactPerson: '赵工',
        contactPhone: '13922222222',
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyARepository.create({
        partyAId: 2003,
        companyName: '已停用甲方主体',
        creditCode: '913301006666666666',
        companyAddress: '深圳市南山区科技园 10 号',
        legalPerson: '周总',
        depositoryBank: '建设银行',
        bankAccountNo: '6217000000000003',
        contactEmail: 'party-a-3@example.com',
        contactPerson: '吴工',
        contactPhone: '13733333333',
        isActive: false,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await powerSupplyRepository.save([
      powerSupplyRepository.create({
        psId: 3001,
        partyAId: 2001,
        powerSupplyAddress: '杭州市滨江区供电点 A',
        powerSupplyNumber: 'PS-2001-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3002,
        partyAId: 2001,
        powerSupplyAddress: '杭州市滨江区供电点 B',
        powerSupplyNumber: 'PS-2001-B',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3003,
        partyAId: 2002,
        powerSupplyAddress: '北京市海淀区供电点 A',
        powerSupplyNumber: 'PS-2002-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 3004,
        partyAId: 2003,
        powerSupplyAddress: '深圳市南山区供电点 A',
        powerSupplyNumber: 'PS-2003-A',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('returns active party a items with nested power supply info', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyAs {
          partyAs {
            total
            items {
              partyAId
              companyName
              creditCode
              isActive
              powerSupplyInfo {
                psId
                partyAId
                powerSupplyAddress
                powerSupplyNumber
              }
            }
          }
        }
      `,
    }).expect(200);

    expect(response.body.errors).toBeUndefined();

    const result = response.body.data.partyAs;
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items.every((item: { isActive: boolean }) => item.isActive)).toBe(true);

    const firstPartyA = result.items.find((item: { partyAId: number }) => item.partyAId === 2001);
    expect(firstPartyA).toBeDefined();
    expect(firstPartyA.powerSupplyInfo).toHaveLength(2);
    expect(firstPartyA.powerSupplyInfo.map((item: { psId: number }) => item.psId)).toEqual([
      3001, 3002,
    ]);

    const secondPartyA = result.items.find((item: { partyAId: number }) => item.partyAId === 2002);
    expect(secondPartyA).toBeDefined();
    expect(secondPartyA.powerSupplyInfo).toHaveLength(1);
    expect(secondPartyA.powerSupplyInfo[0]).toMatchObject({
      psId: 3003,
      partyAId: 2002,
      powerSupplyNumber: 'PS-2002-A',
    });
  });

  it('returns an empty list when filters do not match any active party a', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyAs($input: PartyAsInput) {
          partyAs(input: $input) {
            total
            items {
              partyAId
            }
          }
        }
      `,
      variables: {
        input: {
          creditCode: '000000000000000000',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.partyAs.total).toBe(0);
    expect(response.body.data.partyAs.items).toEqual([]);
  });

  it('rejects an overlong company name filter', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyAs($input: PartyAsInput) {
          partyAs(input: $input) {
            total
          }
        }
      `,
      variables: {
        input: {
          companyName: 'A'.repeat(256),
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('公司名称长度不能超过 255');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
