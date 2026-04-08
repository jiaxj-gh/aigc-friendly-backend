import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ContractEntity } from '@src/modules/power-system/contract/contract.entity';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { QuotationEntity } from '@src/modules/power-system/quotation/quotation.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem deleteContract (e2e)', () => {
  const monthSeptember = '2025-09';
  let app: INestApplication;
  let dataSource: DataSource;
  let contractRepository: Repository<ContractEntity>;
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
    await partyBRepository.createQueryBuilder().delete().execute();
  }

  async function seedContracts(): Promise<void> {
    await partyBRepository.save(
      partyBRepository.create({
        partyBId: 9701,
        configName: '删除测试乙方',
        companyName: '华东售电删除有限公司',
        creditCode: '913301005555555555',
        companyAddress: '杭州市西湖区删除路 9 号',
        legalPerson: '赵六',
        contactPerson: '钱七',
        contactPhone: '13900001111',
        contactEmail: 'delete-contract-party-b@example.com',
        depositoryBank: '招商银行',
        bankAccountNo: '6225888899999999',
        hotLine: '400-999-9999',
        isDefault: true,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );

    await contractRepository.save([
      contractRepository.create({
        contractId: 9801,
        contractCurrentStatus: '待删除',
        isActive: true,
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025009801',
        partyBContractNo: 'YF2025009801',
        submissionTime: null,
        confirmationTime: null,
        contractSignDate: '2025-09-01',
        partyASignDate: '2025-09-01',
        partyBSignDate: '2025-09-02',
        orderTime: null,
        signLocation: '杭州',
        additionalTerms: null,
        partyAId: -1,
        partyBId: 9701,
        partyACustom: true,
        partyACustomCompany: '临时甲方',
        partyACustomCreditCode: null,
        partyACustomLegalPerson: null,
        partyACustomAddress: null,
        partyACustomBank: null,
        partyACustomBankAccount: null,
        partyACustomContactPerson: null,
        partyACustomContactPhone: null,
        filingMethod: '2',
        filingParty: '乙',
        disputeResolutionMethod: '2',
        originalCopies: 2,
        duplicateCopies: 1,
        createdBy: 'seed',
        updatedBy: 'seed',
        createdAt: new Date('2025-09-01T10:00:00.000Z'),
        updatedAt: new Date('2025-09-01T10:00:00.000Z'),
      }),
      contractRepository.create({
        contractId: 9802,
        contractCurrentStatus: '已停用',
        isActive: false,
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025009802',
        partyBContractNo: 'YF2025009802',
        submissionTime: null,
        confirmationTime: null,
        contractSignDate: '2025-09-03',
        partyASignDate: '2025-09-03',
        partyBSignDate: '2025-09-03',
        orderTime: null,
        signLocation: '宁波',
        additionalTerms: null,
        partyAId: -1,
        partyBId: 9701,
        partyACustom: true,
        partyACustomCompany: '停用甲方',
        partyACustomCreditCode: null,
        partyACustomLegalPerson: null,
        partyACustomAddress: null,
        partyACustomBank: null,
        partyACustomBankAccount: null,
        partyACustomContactPerson: null,
        partyACustomContactPhone: null,
        filingMethod: '2',
        filingParty: '乙',
        disputeResolutionMethod: '2',
        originalCopies: 2,
        duplicateCopies: 1,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await quotationRepository.save(
      quotationRepository.create({
        id: 9901,
        contractId: 9801,
        quoteTypeId: 1,
        greenElecAllow: false,
        greenElecPrice: null,
        tradeStartTime: '2025-09-01',
        tradeEndTime: '2025-12-31',
        totalElectricity: 8888,
        monthlyElectricity: {
          [monthSeptember]: 2000,
        },
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
    );
  }

  it('soft deletes an active contract', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeleteContract($input: DeleteContractInput!) {
          deleteContract(input: $input)
        }
      `,
      variables: {
        input: {
          contractId: 9801,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteContract).toBe(true);

    const persisted = await contractRepository.findOneBy({ contractId: 9801 });
    expect(persisted).not.toBeNull();
    expect(persisted?.isActive).toBe(false);
    expect(persisted?.updatedBy).toBe('seed');

    const quotation = await quotationRepository.findOneBy({ contractId: 9801 });
    expect(quotation).not.toBeNull();
  });

  it('returns not found when the contract exists but is already inactive', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeleteContract($input: DeleteContractInput!) {
          deleteContract(input: $input)
        }
      `,
      variables: {
        input: {
          contractId: 9802,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    expect(response.body.errors?.[0]?.extensions?.errorCode).toBe(
      'POWER_SYSTEM_CONTRACT_NOT_FOUND',
    );
  });

  it('returns bad user input when contract id is invalid', async () => {
    const response = await postGql({
      app,
      query: `
        mutation DeleteContract($input: DeleteContractInput!) {
          deleteContract(input: $input)
        }
      `,
      variables: {
        input: {
          contractId: 0,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });
});
