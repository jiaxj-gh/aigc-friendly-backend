import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem partyB (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let partyBRepository: Repository<PartyBEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    partyBRepository = dataSource.getRepository(PartyBEntity);
  });

  beforeEach(async () => {
    await partyBRepository.clear();
    await seedPartyBs();
  });

  afterAll(async () => {
    await partyBRepository.clear();
    if (app) {
      await app.close();
    }
  });

  async function seedPartyBs(): Promise<void> {
    await partyBRepository.save([
      partyBRepository.create({
        partyBId: 1001,
        configName: '默认主体',
        companyName: '华东售电有限公司',
        creditCode: '913301007777777777',
        companyAddress: '杭州市西湖区文三路 1 号',
        legalPerson: '李四',
        contactPerson: '王五',
        contactPhone: '13800000000',
        contactEmail: 'contact-a@example.com',
        depositoryBank: '招商银行',
        bankAccountNo: '6225888888888888',
        hotLine: '400-888-8888',
        isDefault: true,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyBRepository.create({
        partyBId: 1002,
        configName: '已停用主体',
        companyName: '华南售电有限公司',
        creditCode: '913301005555555555',
        companyAddress: '深圳市南山区科技园 3 号',
        legalPerson: '周八',
        contactPerson: '吴九',
        contactPhone: '13700000000',
        contactEmail: 'contact-c@example.com',
        depositoryBank: '建设银行',
        bankAccountNo: '6217000000000000',
        hotLine: '400-666-6666',
        isDefault: false,
        isActive: false,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('returns a single active party b by id', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyB($input: PartyBInput!) {
          partyB(input: $input) {
            partyBId
            configName
            companyName
            creditCode
            isDefault
            isActive
            createdBy
          }
        }
      `,
      variables: {
        input: {
          partyBId: 1001,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.partyB).toMatchObject({
      partyBId: 1001,
      configName: '默认主体',
      companyName: '华东售电有限公司',
      creditCode: '913301007777777777',
      isDefault: true,
      isActive: true,
      createdBy: 'seed',
    });
  });

  it('returns not found when the party b exists but is inactive', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyB($input: PartyBInput!) {
          partyB(input: $input) {
            partyBId
          }
        }
      `,
      variables: {
        input: {
          partyBId: 1002,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('乙方不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.errors[0].extensions.errorCode).toBe('POWER_SYSTEM_PARTY_B_NOT_FOUND');
  });

  it('rejects a non-positive party b id', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyB($input: PartyBInput!) {
          partyB(input: $input) {
            partyBId
          }
        }
      `,
      variables: {
        input: {
          partyBId: 0,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('乙方主体 ID 必须大于 0');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
