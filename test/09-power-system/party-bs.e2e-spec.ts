import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { postGql } from '../utils/e2e-graphql-utils';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem partyBs (e2e)', () => {
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
        configName: '备用主体',
        companyName: '华北售电有限公司',
        creditCode: '913301006666666666',
        companyAddress: '北京市朝阳区光华路 2 号',
        legalPerson: '赵六',
        contactPerson: '孙七',
        contactPhone: '13900000000',
        contactEmail: 'contact-b@example.com',
        depositoryBank: '工商银行',
        bankAccountNo: '6222000000000000',
        hotLine: '400-999-9999',
        isDefault: false,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      partyBRepository.create({
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

  it('returns active party b items with total count', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyBs {
          partyBs {
            total
            items {
              partyBId
              configName
              companyName
              creditCode
              isDefault
              isActive
              contactEmail
            }
          }
        }
      `,
    }).expect(200);

    expect(response.body.errors).toBeUndefined();

    const result = response.body.data.partyBs;
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items.every((item: { isActive: boolean }) => item.isActive)).toBe(true);

    const configNames = result.items.map((item: { configName: string }) => item.configName).sort();
    expect(configNames).toEqual(['备用主体', '默认主体']);
  });

  it('returns an empty list when filters do not match any active party b', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyBs($input: PartyBsInput) {
          partyBs(input: $input) {
            total
            items {
              partyBId
            }
          }
        }
      `,
      variables: {
        input: {
          companyName: '不存在的售电主体',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.partyBs.total).toBe(0);
    expect(response.body.data.partyBs.items).toEqual([]);
  });

  it('rejects an overlong configName filter', async () => {
    const response = await postGql({
      app,
      query: `
        query PartyBs($input: PartyBsInput) {
          partyBs(input: $input) {
            total
          }
        }
      `,
      variables: {
        input: {
          configName: 'A'.repeat(101),
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('配置名称长度不能超过 100');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
