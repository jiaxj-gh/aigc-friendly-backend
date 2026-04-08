import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem createPartyB (e2e)', () => {
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
    await partyBRepository.save(
      partyBRepository.create({
        configName: '既有主体',
        companyName: '既有售电有限公司',
        creditCode: '913301001111111111',
        companyAddress: '上海市浦东新区张江路 1 号',
        legalPerson: '原始法人',
        contactPerson: '原始联系人',
        contactPhone: '13600000000',
        contactEmail: 'existing@example.com',
        depositoryBank: '中国银行',
        bankAccountNo: '6222000000000001',
        hotLine: '400-100-1000',
        isDefault: false,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );
  });

  afterAll(async () => {
    await partyBRepository.clear();
    if (app) {
      await app.close();
    }
  });

  it('creates a new active party b with system-managed audit fields', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreatePartyB($input: CreatePartyBInput!) {
          createPartyB(input: $input) {
            partyBId
            configName
            companyName
            creditCode
            isDefault
            isActive
            createdBy
            updatedBy
          }
        }
      `,
      variables: {
        input: {
          configName: '新增主体',
          companyName: '华中新售电有限公司',
          creditCode: '913301009999999999',
          companyAddress: '武汉市洪山区关山大道 88 号',
          legalPerson: '张三',
          contactPerson: '李四',
          contactPhone: '13500000000',
          contactEmail: 'contact-new@example.com',
          depositoryBank: '农业银行',
          bankAccountNo: '6228488888888888',
          hotLine: '400-123-4567',
          isDefault: true,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createPartyB).toMatchObject({
      configName: '新增主体',
      companyName: '华中新售电有限公司',
      creditCode: '913301009999999999',
      isDefault: true,
      isActive: true,
      createdBy: 'admin',
      updatedBy: 'admin',
    });
    expect(response.body.data.createPartyB.partyBId).toBeGreaterThan(0);

    const persisted = await partyBRepository.findOneBy({
      partyBId: response.body.data.createPartyB.partyBId,
    });
    expect(persisted).not.toBeNull();
    expect(persisted?.isActive).toBe(true);
    expect(persisted?.createdBy).toBe('admin');
  });

  it('rejects a whitespace-only config name via usecase normalization', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreatePartyB($input: CreatePartyBInput!) {
          createPartyB(input: $input) {
            partyBId
          }
        }
      `,
      variables: {
        input: {
          configName: '   ',
          companyName: '华中新售电有限公司',
          creditCode: '913301009999999999',
          companyAddress: '武汉市洪山区关山大道 88 号',
          legalPerson: '张三',
          contactPerson: '李四',
          contactPhone: '13500000000',
          contactEmail: 'contact-new@example.com',
          depositoryBank: '农业银行',
          bankAccountNo: '6228488888888888',
          hotLine: '400-123-4567',
          isDefault: false,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('配置名称 不能为空');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('rejects an overlong company name', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreatePartyB($input: CreatePartyBInput!) {
          createPartyB(input: $input) {
            partyBId
          }
        }
      `,
      variables: {
        input: {
          configName: '新增主体',
          companyName: 'A'.repeat(256),
          creditCode: '913301009999999999',
          companyAddress: '武汉市洪山区关山大道 88 号',
          legalPerson: '张三',
          contactPerson: '李四',
          contactPhone: '13500000000',
          contactEmail: 'contact-new@example.com',
          depositoryBank: '农业银行',
          bankAccountNo: '6228488888888888',
          hotLine: '400-123-4567',
          isDefault: false,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('公司名称长度不能超过 255');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
