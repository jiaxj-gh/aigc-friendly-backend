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

describe('PowerSystem contract (e2e)', () => {
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

    await powerSupplyRepository.save([
      powerSupplyRepository.create({
        psId: 9151,
        partyAId: 9101,
        powerSupplyAddress: '杭州市高新区 1 号园区',
        powerSupplyNumber: 'PS-0001',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      powerSupplyRepository.create({
        psId: 9152,
        partyAId: 9101,
        powerSupplyAddress: '杭州市高新区 2 号园区',
        powerSupplyNumber: 'PS-0002',
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
        electricityDeviation: 1.1,
        positiveDeviationRatio: 2.2,
        positiveDeviationPrice: 3.3,
        negativeDeviationRatio: 4.4,
        negativeDeviationPrice: 5.5,
        standardCurveMethod: true,
        curveModifyDays: 3,
        curveDeviation: 6.6,
        curvePositiveRatio: 7.7,
        curvePositivePrice: 8.8,
        curveNegativeRatio: 9.9,
        curveNegativePrice: 10.1,
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

    await fixedPriceDetailsRepository.save([
      fixedPriceDetailsRepository.create({
        id: 9451,
        quotationId: 9401,
        fixedPriceRatio: 100,
        marketTransactionPrice: 392.5,
        priceLimit: 405.5,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await proportionSharingDetailsRepository.save([
      proportionSharingDetailsRepository.create({
        id: 9461,
        quotationId: 9402,
        psPropSharingRatio: 80,
        psDistRefPrice: 12.5,
        psLongTermTransRatio: 35,
        psPartyAPropBelowLongTerm: 40,
        psPartyBPropBelowLongTerm: 60,
        psPartyAPropAboveLongTerm: 55,
        psPartyBPropAboveLongTerm: 45,
        psMonthlyBidRatio: 20,
        psPartyAPropBelowMonthlyBid: 41,
        psPartyBPropBelowMonthlyBid: 59,
        psPartyAPropAboveMonthlyBid: 56,
        psPartyBPropAboveMonthlyBid: 44,
        psAgentProcRatio: 15,
        psPartyAPropBelowAgentProc: 42,
        psPartyBPropBelowAgentProc: 58,
        psPartyAPropAboveAgentProc: 57,
        psPartyBPropAboveAgentProc: 43,
        psIntraMonthRatio: 10,
        psPartyAPropBelowIntraMonth: 43,
        psPartyBPropBelowIntraMonth: 57,
        psPartyAPropAboveIntraMonth: 58,
        psPartyBPropAboveIntraMonth: 42,
        psLongTermTransLimit: 430,
        psMonthlyBidLimit: 440,
        psAgentProcLimit: 450,
        psIntraMonthLimit: 460,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);
  }

  it('returns a contract detail with real party A, power supply info and quotation details', async () => {
    const response = await postGql({
      app,
      query: `
        query Contract($input: ContractInput!) {
          contract(input: $input) {
            basicInfo {
              contractId
              contractCurrentStatus
              createdBy
              updatedBy
              isActive
            }
            contractContent {
              workOrderNumber
              partyAContractNo
              partyBContractNo
              signLocation
              filingParty
              partyA {
                partyAId
                companyName
                contactPerson
                powerSupplyInfo {
                  psId
                  powerSupplyAddress
                  powerSupplyNumber
                }
              }
              partyB {
                partyBId
                companyName
                contactPerson
              }
              quotationInfo {
                quoteTypeId
                quoteType
                greenElecAllow
                greenElecPrice
                totalElectricity
                monthlyElectricity
                standardCurveMethod
                quoteDetails
              }
            }
          }
        }
      `,
      variables: {
        input: {
          contractId: 9301,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.contract.basicInfo).toMatchObject({
      contractId: 9301,
      contractCurrentStatus: '草稿',
      createdBy: 'seed',
      updatedBy: 'seed',
      isActive: true,
    });
    expect(response.body.data.contract.contractContent).toMatchObject({
      workOrderNumber: 'WO-001',
      partyAContractNo: 'JF2025001',
      partyBContractNo: 'YF2025001',
      signLocation: '杭州',
      filingParty: '乙',
      partyA: {
        partyAId: 9101,
        companyName: '华东用电科技有限公司',
        contactPerson: '王工',
      },
      partyB: {
        partyBId: 9201,
        companyName: '华东售电有限公司',
        contactPerson: '王五',
      },
      quotationInfo: {
        quoteTypeId: 1,
        quoteType: '固定价格',
        greenElecAllow: true,
        greenElecPrice: 8.88,
        totalElectricity: 1200.5,
        monthlyElectricity: { ['2025-01']: 100.5 },
        standardCurveMethod: true,
        quoteDetails: {
          fixed_price_ratio: 100,
          market_transaction_price: 392.5,
          price_limit: 405.5,
        },
      },
    });
    expect(response.body.data.contract.contractContent.partyA.powerSupplyInfo).toEqual([
      {
        psId: 9151,
        powerSupplyAddress: '杭州市高新区 1 号园区',
        powerSupplyNumber: 'PS-0001',
      },
      {
        psId: 9152,
        powerSupplyAddress: '杭州市高新区 2 号园区',
        powerSupplyNumber: 'PS-0002',
      },
    ]);
  });

  it('returns a synthetic custom party A when the contract uses custom party A fields', async () => {
    const response = await postGql({
      app,
      query: `
        query Contract($input: ContractInput!) {
          contract(input: $input) {
            contractContent {
              partyAId
              partyACustom
              partyACustomCompany
              partyA {
                partyAId
                companyName
                creditCode
                contactPerson
                contactPhone
                createdBy
                updatedBy
                powerSupplyInfo {
                  psId
                }
              }
              quotationInfo {
                quoteTypeId
                quoteType
                quoteDetails
              }
            }
          }
        }
      `,
      variables: {
        input: {
          contractId: 9302,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.contract.contractContent).toMatchObject({
      partyAId: -1,
      partyACustom: true,
      partyACustomCompany: '临时项目合作电力有限公司',
      partyA: {
        partyAId: -1,
        companyName: '临时项目合作电力有限公司',
        creditCode: '91310100TEMP000001',
        contactPerson: '钱经理',
        contactPhone: '13666666666',
        createdBy: 'custom',
        updatedBy: 'custom',
        powerSupplyInfo: [],
      },
      quotationInfo: {
        quoteTypeId: 2,
        quoteType: '比例分成',
        quoteDetails: {
          ps_prop_sharing_ratio: 80,
          ps_dist_ref_price: 12.5,
          ps_long_term_trans_ratio: 35,
        },
      },
    });
  });

  it('returns NOT_FOUND when the contract exists but is inactive', async () => {
    const response = await postGql({
      app,
      query: `
        query Contract($input: ContractInput!) {
          contract(input: $input) {
            basicInfo {
              contractId
            }
          }
        }
      `,
      variables: {
        input: {
          contractId: 9303,
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
        query Contract($input: ContractInput!) {
          contract(input: $input) {
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
    expect(response.body.errors[0].message).toContain('合同 ID 必须大于 0');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
