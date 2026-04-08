import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem deletePartyB (e2e)', () => {
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
        partyBId: 4001,
        configName: '待删除主体',
        companyName: '华南售电有限公司',
        creditCode: '913301005555555555',
        companyAddress: '深圳市南山区科技园 3 号',
        legalPerson: '原法人',
        contactPerson: '原联系人',
        contactPhone: '13700000000',
        contactEmail: 'active@example.com',
        depositoryBank: '建设银行',
        bankAccountNo: '6217000000000000',
        hotLine: '400-666-6666',
        isDefault: false,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyBRepository.create({
        partyBId: 4002,
        configName: '已停用主体',
        companyName: '华北售电有限公司',
        creditCode: '913301006666666666',
        companyAddress: '北京市朝阳区光华路 2 号',
        legalPerson: '停用法人',
        contactPerson: '停用联系人',
        contactPhone: '13900000000',
        contactEmail: 'inactive@example.com',
        depositoryBank: '工商银行',
        bankAccountNo: '6222000000000000',
        hotLine: '400-999-9999',
        isDefault: false,
        isActive: false,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('soft deletes an active party b', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeletePartyB($input: DeletePartyBInput!) {
          deletePartyB(input: $input)
        }
      `,
      variables: {
        input: {
          partyBId: 4001,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deletePartyB).toBe(true);

    const persisted = await partyBRepository.findOneBy({ partyBId: 4001 });
    expect(persisted).not.toBeNull();
    expect(persisted?.isActive).toBe(false);
    expect(persisted?.updatedBy).toBe('seed');
  });

  it('returns not found when the party b exists but is already inactive', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeletePartyB($input: DeletePartyBInput!) {
          deletePartyB(input: $input)
        }
      `,
      variables: {
        input: {
          partyBId: 4002,
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
        mutation DeletePartyB($input: DeletePartyBInput!) {
          deletePartyB(input: $input)
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
