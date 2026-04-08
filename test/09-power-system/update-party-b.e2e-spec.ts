import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem updatePartyB (e2e)', () => {
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
        partyBId: 3001,
        configName: '待更新主体',
        companyName: '西南售电有限公司',
        creditCode: '913301003333333333',
        companyAddress: '成都市高新区天府大道 66 号',
        legalPerson: '原法人',
        contactPerson: '原联系人',
        contactPhone: '13666666666',
        contactEmail: 'before-update@example.com',
        depositoryBank: '交通银行',
        bankAccountNo: '6222600000000000',
        hotLine: '400-222-2222',
        isDefault: false,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyBRepository.create({
        partyBId: 3002,
        configName: '已停用主体',
        companyName: '西北售电有限公司',
        creditCode: '913301004444444444',
        companyAddress: '西安市高新区科技路 88 号',
        legalPerson: '停用法人',
        contactPerson: '停用联系人',
        contactPhone: '13777777777',
        contactEmail: 'inactive@example.com',
        depositoryBank: '邮储银行',
        bankAccountNo: '6221500000000000',
        hotLine: '400-333-3333',
        isDefault: false,
        isActive: false,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('updates an active party b and preserves untouched fields', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdatePartyB($input: UpdatePartyBInput!) {
          updatePartyB(input: $input) {
            partyBId
            configName
            contactPhone
            isDefault
            legalPerson
            updatedBy
          }
        }
      `,
      variables: {
        input: {
          partyBId: 3001,
          configName: '已更新主体',
          contactPhone: '13511112222',
          isDefault: true,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updatePartyB).toMatchObject({
      partyBId: 3001,
      configName: '已更新主体',
      contactPhone: '13511112222',
      isDefault: true,
      legalPerson: '原法人',
      updatedBy: 'admin',
    });

    const persisted = await partyBRepository.findOneBy({ partyBId: 3001 });
    expect(persisted).not.toBeNull();
    expect(persisted?.configName).toBe('已更新主体');
    expect(persisted?.contactPhone).toBe('13511112222');
    expect(persisted?.isDefault).toBe(true);
    expect(persisted?.legalPerson).toBe('原法人');
    expect(persisted?.updatedBy).toBe('admin');
  });

  it('returns not found when the party b exists but is inactive', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdatePartyB($input: UpdatePartyBInput!) {
          updatePartyB(input: $input) {
            partyBId
          }
        }
      `,
      variables: {
        input: {
          partyBId: 3002,
          configName: '不会生效',
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('乙方不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.errors[0].extensions.errorCode).toBe('POWER_SYSTEM_PARTY_B_NOT_FOUND');
  });

  it('rejects an overlong company name', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdatePartyB($input: UpdatePartyBInput!) {
          updatePartyB(input: $input) {
            partyBId
          }
        }
      `,
      variables: {
        input: {
          partyBId: 3001,
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
