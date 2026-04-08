import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ContractEntity } from '@src/modules/power-system/contract/contract.entity';
import { PartyAEntity } from '@src/modules/power-system/party-a/party-a.entity';
import { PowerSupplyEntity } from '@src/modules/power-system/party-a/power-supply.entity';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { FixedPriceDetailsEntity } from '@src/modules/power-system/quotation/fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from '@src/modules/power-system/quotation/price-difference-details.entity';
import { ProportionSharingDetailsEntity } from '@src/modules/power-system/quotation/proportion-sharing-details.entity';
import { QuotationEntity } from '@src/modules/power-system/quotation/quotation.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem updateContract (e2e)', () => {
  const monthSeptember = '2025-09';
  const monthOctober = '2025-10';

  let app: INestApplication;
  let dataSource: DataSource;
  let contractRepository: Repository<ContractEntity>;
  let partyARepository: Repository<PartyAEntity>;
  let powerSupplyRepository: Repository<PowerSupplyEntity>;
  let partyBRepository: Repository<PartyBEntity>;
  let quotationRepository: Repository<QuotationEntity>;
  let fixedPriceDetailsRepository: Repository<FixedPriceDetailsEntity>;
  let proportionSharingDetailsRepository: Repository<ProportionSharingDetailsEntity>;
  let priceDifferenceDetailsRepository: Repository<PriceDifferenceDetailsEntity>;

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
    powerSupplyRepository = dataSource.getRepository(PowerSupplyEntity);
    partyBRepository = dataSource.getRepository(PartyBEntity);
    quotationRepository = dataSource.getRepository(QuotationEntity);
    fixedPriceDetailsRepository = dataSource.getRepository(FixedPriceDetailsEntity);
    proportionSharingDetailsRepository = dataSource.getRepository(ProportionSharingDetailsEntity);
    priceDifferenceDetailsRepository = dataSource.getRepository(PriceDifferenceDetailsEntity);
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
    await fixedPriceDetailsRepository.createQueryBuilder().delete().execute();
    await proportionSharingDetailsRepository.createQueryBuilder().delete().execute();
    await priceDifferenceDetailsRepository.createQueryBuilder().delete().execute();
    await quotationRepository.createQueryBuilder().delete().execute();
    await contractRepository.createQueryBuilder().delete().execute();
    await powerSupplyRepository.createQueryBuilder().delete().execute();
    await partyARepository.createQueryBuilder().delete().execute();
    await partyBRepository.createQueryBuilder().delete().execute();
  }

  async function seedContracts(): Promise<void> {
    await partyARepository.save(
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
    );

    await powerSupplyRepository.save(
      powerSupplyRepository.create({
        psId: 9151,
        partyAId: 9101,
        powerSupplyAddress: '杭州市高新区 1 号园区',
        powerSupplyNumber: 'PS-0001',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );

    await partyBRepository.save(
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
    );

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
        additionalTerms: '补充条款 A',
        disputeResolutionMethod: '2',
        filingMethod: '2',
        filingParty: '乙',
        partyBTerminationBefore30: 12.5,
        partyBTerminationOther: 15.5,
        partyBTerminationActive: 16.5,
        partyATerminationBefore30: 10.5,
        partyATerminationIn30: 11.5,
        partyATerminationActive: 13.5,
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
        contractCurrentStatus: '已删除',
        isActive: false,
        workOrderNumber: 'WO-002',
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025002',
        partyBContractNo: 'YF2025002',
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
      }),
    ]);

    await quotationRepository.save(
      quotationRepository.create({
        id: 9401,
        contractId: 9301,
        quoteTypeId: 1,
        greenElecAllow: true,
        greenElecPrice: 0.05,
        tradeStartTime: '2025-09-01',
        tradeEndTime: '2025-12-31',
        totalElectricity: 10000,
        monthlyElectricity: {
          [monthSeptember]: 1000,
          [monthOctober]: 1200,
        },
        electricityDeviation: 5,
        positiveDeviationRatio: 10,
        positiveDeviationPrice: 0.03,
        negativeDeviationRatio: 8,
        negativeDeviationPrice: 0.02,
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

    await fixedPriceDetailsRepository.save(
      fixedPriceDetailsRepository.create({
        id: 9501,
        quotationId: 9401,
        fixedPriceRatio: 100,
        marketTransactionPrice: 0.48,
        priceLimit: 0.55,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );
  }

  it('updates an active contract, switches to custom party A, and migrates quotation details to a new quote type', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdateContract($input: UpdateContractInput!) {
          updateContract(input: $input) {
            basicInfo {
              contractId
              contractCurrentStatus
              updatedBy
            }
            contractContent {
              partyAId
              partyACustom
              partyACustomCompany
              partyA {
                partyAId
                companyName
                createdBy
                updatedBy
              }
              quotationInfo {
                quoteTypeId
                quoteType
                tradeStartTime
                tradeEndTime
                totalElectricity
                greenElecAllow
                quoteDetails
              }
            }
          }
        }
      `,
      variables: {
        input: {
          contractId: 9301,
          contractCurrentStatus: '已确认',
          partyACustom: true,
          partyACustomCompany: '更新后的临时甲方',
          partyACustomContactPerson: '赵经理',
          partyACustomContactPhone: '13900000000',
          quotation: {
            quoteTypeId: 2,
            greenElecAllow: false,
            quoteDetails: {
              psPropSharingRatio: 77,
              psDistRefPrice: 0.35,
            },
          },
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateContract).toMatchObject({
      basicInfo: {
        contractId: 9301,
        contractCurrentStatus: '已确认',
        updatedBy: 'admin',
      },
      contractContent: {
        partyAId: -1,
        partyACustom: true,
        partyACustomCompany: '更新后的临时甲方',
        partyA: {
          partyAId: -1,
          companyName: '更新后的临时甲方',
          createdBy: 'custom',
          updatedBy: 'custom',
        },
        quotationInfo: {
          quoteTypeId: 2,
          quoteType: '比例分成',
          tradeStartTime: '2025-09-01',
          tradeEndTime: '2025-12-31',
          totalElectricity: 10000,
          greenElecAllow: false,
          quoteDetails: {
            ps_prop_sharing_ratio: 77,
            ps_dist_ref_price: 0.35,
          },
        },
      },
    });

    const persistedContract = await contractRepository.findOneBy({ contractId: 9301 });
    expect(persistedContract).not.toBeNull();
    expect(persistedContract?.partyAId).toBe(-1);
    expect(persistedContract?.partyACustom).toBe(true);
    expect(persistedContract?.contractCurrentStatus).toBe('已确认');

    const persistedQuotation = await quotationRepository.findOneBy({
      contractId: 9301,
    });
    expect(persistedQuotation).not.toBeNull();
    expect(persistedQuotation?.quoteTypeId).toBe(2);
    expect(persistedQuotation?.greenElecAllow).toBe(false);
    expect(persistedQuotation?.updatedBy).toBe('admin');

    expect(
      await fixedPriceDetailsRepository.countBy({
        quotationId: persistedQuotation?.id ?? -1,
      }),
    ).toBe(0);

    const persistedProportionDetails = await proportionSharingDetailsRepository.findOneBy({
      quotationId: persistedQuotation?.id ?? -1,
    });
    expect(persistedProportionDetails).not.toBeNull();
    expect(persistedProportionDetails?.psPropSharingRatio).toBe(77);
    expect(persistedProportionDetails?.psDistRefPrice).toBe(0.35);
  });

  it('returns NOT_FOUND when the contract does not exist', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdateContract($input: UpdateContractInput!) {
          updateContract(input: $input) {
            basicInfo {
              contractId
            }
          }
        }
      `,
      variables: {
        input: {
          contractId: 999999,
          contractCurrentStatus: '已确认',
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('合同不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('rejects a non-positive contract id', async () => {
    const response = await postGql({
      app,
      query: `
        mutation UpdateContract($input: UpdateContractInput!) {
          updateContract(input: $input) {
            basicInfo {
              contractId
            }
          }
        }
      `,
      variables: {
        input: {
          contractId: 0,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('合同 ID 必须是大于 0 的整数');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
