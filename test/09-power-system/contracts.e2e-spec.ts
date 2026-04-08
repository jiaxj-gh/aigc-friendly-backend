import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { QuotationEntity } from '@src/modules/power-system/quotation/quotation.entity';
import { ContractEntity } from '@src/modules/power-system/contract/contract.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem contracts (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let contractRepository: Repository<ContractEntity>;
  let partyARepository: Repository<PartyAEntity>;
  let partyBRepository: Repository<PartyBEntity>;
  let quotationRepository: Repository<QuotationEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    contractRepository = dataSource.getRepository(ContractEntity);
    partyARepository = dataSource.getRepository(PartyAEntity);
    partyBRepository = dataSource.getRepository(PartyBEntity);
    quotationRepository = dataSource.getRepository(QuotationEntity);
  });

  beforeEach(async () => {
    await clearTables();
    await seedContracts();
  });

  afterAll(async () => {
    await clearTables();
    if (app) {
      await app.close();
    }
  });

  async function clearTables(): Promise<void> {
    await quotationRepository.createQueryBuilder().delete().execute();
    await contractRepository.createQueryBuilder().delete().execute();
    await partyARepository.createQueryBuilder().delete().execute();
    await partyBRepository.createQueryBuilder().delete().execute();
  }

  async function seedContracts(): Promise<void> {
    await partyARepository.save([
      partyARepository.create({
        partyAId: 9101,
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
    ]);

    await partyBRepository.save([
      partyBRepository.create({
        partyBId: 9201,
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
    ]);

    await contractRepository.save([
      contractRepository.create({
        contractId: 9301,
        contractCurrentStatus: '草稿',
        isActive: true,
        workOrderNumber: 'WO-001',
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025001',
        partyBContractNo: 'YF2025001',
        submissionTime: new Date('2025-08-29T10:00:00.000Z'),
        confirmationTime: null,
        contractSignDate: '2025-08-29',
        partyASignDate: '2025-08-29',
        partyBSignDate: '2025-08-30',
        orderTime: new Date('2025-08-29T15:00:00.000Z'),
        signLocation: '杭州',
        additionalTerms: null,
        disputeResolutionMethod: '2',
        filingMethod: '2',
        filingParty: '乙',
        partyBTerminationBefore30: null,
        partyBTerminationOther: null,
        partyBTerminationActive: null,
        partyATerminationBefore30: null,
        partyATerminationIn30: null,
        partyATerminationActive: null,
        originalCopies: 2,
        duplicateCopies: 1,
        partyACustom: false,
        partyACustomCompany: null,
        partyACustomCreditCode: null,
        partyACustomLegalPerson: null,
        partyACustomAddress: null,
        partyACustomBank: null,
        partyACustomBankAccount: null,
        partyACustomContactPerson: null,
        partyACustomContactPhone: null,
        partyAId: 9101,
        partyBId: 9201,
        createdBy: 'seed',
        updatedBy: 'seed',
        createdAt: new Date('2025-08-29T10:00:00.000Z'),
        updatedAt: new Date('2025-08-29T10:00:00.000Z'),
      }),
      contractRepository.create({
        contractId: 9302,
        contractCurrentStatus: '待确认',
        isActive: true,
        workOrderNumber: 'WO-002',
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025002',
        partyBContractNo: 'YF2025002',
        submissionTime: new Date('2025-08-30T10:00:00.000Z'),
        confirmationTime: null,
        contractSignDate: '2025-08-30',
        partyASignDate: '2025-08-30',
        partyBSignDate: '2025-08-31',
        orderTime: new Date('2025-08-30T15:00:00.000Z'),
        signLocation: '上海',
        additionalTerms: null,
        disputeResolutionMethod: '2',
        filingMethod: '2',
        filingParty: '乙',
        partyBTerminationBefore30: null,
        partyBTerminationOther: null,
        partyBTerminationActive: null,
        partyATerminationBefore30: null,
        partyATerminationIn30: null,
        partyATerminationActive: null,
        originalCopies: 2,
        duplicateCopies: 1,
        partyACustom: true,
        partyACustomCompany: '临时项目合作电力有限公司',
        partyACustomCreditCode: '91310100TEMP000001',
        partyACustomLegalPerson: '赵总',
        partyACustomAddress: '上海市浦东新区临港大道 99 号',
        partyACustomBank: '中国银行',
        partyACustomBankAccount: '6222000012345678',
        partyACustomContactPerson: '钱经理',
        partyACustomContactPhone: '13666666666',
        partyAId: -1,
        partyBId: 9201,
        createdBy: 'seed',
        updatedBy: 'seed',
        createdAt: new Date('2025-08-30T10:00:00.000Z'),
        updatedAt: new Date('2025-08-30T10:00:00.000Z'),
      }),
      contractRepository.create({
        contractId: 9303,
        contractCurrentStatus: '已删除',
        isActive: false,
        workOrderNumber: 'WO-003',
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025003',
        partyBContractNo: 'YF2025003',
        submissionTime: null,
        confirmationTime: null,
        contractSignDate: '2025-08-28',
        partyASignDate: '2025-08-28',
        partyBSignDate: '2025-08-28',
        orderTime: null,
        signLocation: '南京',
        additionalTerms: null,
        disputeResolutionMethod: '2',
        filingMethod: '2',
        filingParty: '乙',
        partyBTerminationBefore30: null,
        partyBTerminationOther: null,
        partyBTerminationActive: null,
        partyATerminationBefore30: null,
        partyATerminationIn30: null,
        partyATerminationActive: null,
        originalCopies: 2,
        duplicateCopies: 1,
        partyACustom: false,
        partyACustomCompany: null,
        partyACustomCreditCode: null,
        partyACustomLegalPerson: null,
        partyACustomAddress: null,
        partyACustomBank: null,
        partyACustomBankAccount: null,
        partyACustomContactPerson: null,
        partyACustomContactPhone: null,
        partyAId: 9101,
        partyBId: 9201,
        createdBy: 'seed',
        updatedBy: 'seed',
        createdAt: new Date('2025-08-28T10:00:00.000Z'),
        updatedAt: new Date('2025-08-28T10:00:00.000Z'),
      }),
    ]);

    await quotationRepository.save([
      quotationRepository.create({
        id: 9401,
        contractId: 9301,
        quoteTypeId: 1,
        greenElecAllow: true,
        greenElecPrice: 8.88,
        tradeStartTime: '2025-01-01',
        tradeEndTime: '2025-12-31',
        totalElectricity: 1200.5,
        monthlyElectricity: { ['2025-01']: 100.5 },
        electricityDeviation: null,
        positiveDeviationRatio: null,
        positiveDeviationPrice: null,
        negativeDeviationRatio: null,
        negativeDeviationPrice: null,
        standardCurveMethod: false,
        curveModifyDays: null,
        curveDeviation: null,
        curvePositiveRatio: null,
        curvePositivePrice: null,
        curveNegativeRatio: null,
        curveNegativePrice: null,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      quotationRepository.create({
        id: 9402,
        contractId: 9302,
        quoteTypeId: 2,
        greenElecAllow: false,
        greenElecPrice: null,
        tradeStartTime: '2025-03-01',
        tradeEndTime: '2025-12-31',
        totalElectricity: 800,
        monthlyElectricity: { ['2025-03']: 80 },
        electricityDeviation: null,
        positiveDeviationRatio: null,
        positiveDeviationPrice: null,
        negativeDeviationRatio: null,
        negativeDeviationPrice: null,
        standardCurveMethod: false,
        curveModifyDays: null,
        curveDeviation: null,
        curvePositiveRatio: null,
        curvePositivePrice: null,
        curveNegativeRatio: null,
        curveNegativePrice: null,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('returns paginated active contracts with party display fields and quotation summary', async () => {
    const response = await postGql({
      app,
      query: `
        query Contracts($input: ContractsInput) {
          contracts(input: $input) {
            items {
              contractId
              partyAContractNo
              partyBContractNo
              contractCurrentStatus
              partyACompanyName
              partyAContactPerson
              partyAContactPhone
              partyBCompanyName
              partyBContactPerson
              partyBContactPhone
              quoteType
              quoteTypeId
              greenElecAllow
              totalElectricity
            }
            pagination {
              page
              pageSize
              total
              totalPages
              hasNext
              hasPrev
            }
          }
        }
      `,
      variables: {
        input: {
          page: 1,
          pageSize: 1,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.contracts.pagination).toMatchObject({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    });
    expect(response.body.data.contracts.items).toHaveLength(1);
    expect(response.body.data.contracts.items[0]).toMatchObject({
      contractId: 9302,
      partyAContractNo: 'JF2025002',
      partyBContractNo: 'YF2025002',
      contractCurrentStatus: '待确认',
      partyACompanyName: '临时项目合作电力有限公司',
      partyAContactPerson: '钱经理',
      partyAContactPhone: '13666666666',
      partyBCompanyName: '华东售电有限公司',
      partyBContactPerson: '王五',
      partyBContactPhone: '13800000000',
      quoteType: '比例分成',
      quoteTypeId: 2,
      greenElecAllow: false,
      totalElectricity: 800,
    });
  });

  it('returns an empty page when filters do not match any active contract', async () => {
    const response = await postGql({
      app,
      query: `
        query Contracts($input: ContractsInput) {
          contracts(input: $input) {
            items {
              contractId
            }
            pagination {
              page
              pageSize
              total
              totalPages
              hasNext
              hasPrev
            }
          }
        }
      `,
      variables: {
        input: {
          partyAId: 9999,
          page: 1,
          pageSize: 20,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.contracts.items).toEqual([]);
    expect(response.body.data.contracts.pagination).toMatchObject({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('rejects an oversized page size', async () => {
    const response = await postGql({
      app,
      query: `
        query Contracts($input: ContractsInput) {
          contracts(input: $input) {
            pagination {
              total
            }
          }
        }
      `,
      variables: {
        input: {
          pageSize: 101,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('每页数量 不能超过 100');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
