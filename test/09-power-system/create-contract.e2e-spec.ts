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

describe('PowerSystem createContract (e2e)', () => {
  const monthMay = '2026-05';
  const monthJune = '2026-06';
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
    await seedBaseRelations();
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

  async function seedBaseRelations(): Promise<void> {
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
  }

  it('creates a custom-party-a contract and preserves the legacy sentinel partyAId behavior', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreateContract($input: CreateContractInput!) {
          createContract(input: $input) {
            basicInfo {
              contractId
              contractCurrentStatus
              createdBy
              updatedBy
              isActive
            }
            contractContent {
              partyAId
              partyACustom
              partyACustomCompany
              filingMethod
              filingParty
              partyA {
                partyAId
                companyName
                createdBy
                updatedBy
              }
              partyB {
                partyBId
                companyName
              }
              quotationInfo {
                quoteTypeId
                quoteType
                tradeStartTime
                tradeEndTime
                totalElectricity
                greenElecAllow
                greenElecPrice
                monthlyElectricity
                quoteDetails
              }
            }
          }
        }
      `,
      variables: {
        input: {
          partyAContractNo: 'JF2026001',
          partyBContractNo: 'YF2026001',
          partyASignDate: '2026-04-01',
          partyBSignDate: '2026-04-02',
          signLocation: '杭州',
          partyACustom: true,
          partyACustomCompany: '临时项目合作电力有限公司',
          partyACustomCreditCode: '91330100TEMP000001',
          partyACustomLegalPerson: '赵总',
          partyACustomAddress: '上海市浦东新区临港大道 99 号',
          partyACustomBank: '中国银行',
          partyACustomBankAccount: '6222000012345678',
          partyACustomContactPerson: '钱经理',
          partyACustomContactPhone: '13666666666',
          partyBId: 9201,
          quotation: {
            quoteTypeId: 2,
            tradeStartTime: '2026-05-01',
            tradeEndTime: '2026-12-31',
            totalElectricity: 18888.88,
            monthlyElectricity: {
              [monthMay]: 1000,
              [monthJune]: 1200,
            },
            greenElecAllow: true,
            greenElecPrice: 0.05,
            quoteDetails: {
              psPropSharingRatio: 88,
              psDistRefPrice: 0.42,
              psLongTermTransRatio: 60,
            },
          },
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createContract).toMatchObject({
      basicInfo: {
        contractCurrentStatus: '草稿',
        createdBy: 'admin',
        updatedBy: 'admin',
        isActive: true,
      },
      contractContent: {
        partyAId: -1,
        partyACustom: true,
        partyACustomCompany: '临时项目合作电力有限公司',
        filingMethod: '2',
        filingParty: '乙',
        partyA: {
          partyAId: -1,
          companyName: '临时项目合作电力有限公司',
          createdBy: 'custom',
          updatedBy: 'custom',
        },
        partyB: {
          partyBId: 9201,
          companyName: '华东售电有限公司',
        },
        quotationInfo: {
          quoteTypeId: 2,
          quoteType: '比例分成',
          tradeStartTime: '2026-05-01',
          tradeEndTime: '2026-12-31',
          totalElectricity: 18888.88,
          greenElecAllow: true,
          greenElecPrice: 0.05,
          monthlyElectricity: {
            [monthMay]: 1000,
            [monthJune]: 1200,
          },
          quoteDetails: {
            ps_prop_sharing_ratio: 88,
            ps_dist_ref_price: 0.42,
            ps_long_term_trans_ratio: 60,
          },
        },
      },
    });
    expect(response.body.data.createContract.basicInfo.contractId).toBeGreaterThan(0);

    const persistedContract = await contractRepository.findOneBy({
      contractId: response.body.data.createContract.basicInfo.contractId,
    });
    expect(persistedContract).not.toBeNull();
    expect(persistedContract?.partyAId).toBe(-1);
    expect(persistedContract?.partyACustom).toBe(true);

    const persistedShadowPartyA = await partyARepository.find({
      where: { companyName: '临时项目合作电力有限公司' },
      order: { partyAId: 'ASC' },
    });
    expect(persistedShadowPartyA).toHaveLength(1);
    expect(persistedShadowPartyA[0]?.isActive).toBe(true);
    expect(persistedShadowPartyA[0]?.createdBy).toBe('admin');

    const persistedQuotation = await quotationRepository.findOneBy({
      contractId: response.body.data.createContract.basicInfo.contractId,
      quoteTypeId: 2,
    });
    expect(persistedQuotation).not.toBeNull();
    expect(persistedQuotation?.createdBy).toBe('admin');

    const persistedProportionDetails = await proportionSharingDetailsRepository.findOneBy({
      quotationId: persistedQuotation?.id ?? -1,
    });
    expect(persistedProportionDetails).not.toBeNull();
    expect(persistedProportionDetails?.psPropSharingRatio).toBe(88);
    expect(persistedProportionDetails?.createdBy).toBe('admin');
  });

  it('returns NOT_FOUND when the target party b does not exist', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreateContract($input: CreateContractInput!) {
          createContract(input: $input) {
            basicInfo {
              contractId
            }
          }
        }
      `,
      variables: {
        input: {
          partyAContractNo: 'JF2026002',
          partyBContractNo: 'YF2026002',
          partyASignDate: '2026-04-01',
          partyBSignDate: '2026-04-02',
          signLocation: '杭州',
          partyAId: 9101,
          partyBId: 999999,
          quotation: {
            quoteTypeId: 1,
            tradeStartTime: '2026-05-01',
            tradeEndTime: '2026-12-31',
            totalElectricity: 8000,
            monthlyElectricity: {
              [monthMay]: 800,
            },
            greenElecAllow: false,
            quoteDetails: {
              fixedPriceRatio: 100,
            },
          },
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('乙方不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(await contractRepository.count()).toBe(0);
  });

  it('rejects quotation payloads that allow green electricity but omit the green electricity price', async () => {
    const response = await postGql({
      app,
      query: `
        mutation CreateContract($input: CreateContractInput!) {
          createContract(input: $input) {
            basicInfo {
              contractId
            }
          }
        }
      `,
      variables: {
        input: {
          partyAContractNo: 'JF2026003',
          partyBContractNo: 'YF2026003',
          partyASignDate: '2026-04-01',
          partyBSignDate: '2026-04-02',
          signLocation: '杭州',
          partyAId: 9101,
          partyBId: 9201,
          quotation: {
            quoteTypeId: 1,
            tradeStartTime: '2026-05-01',
            tradeEndTime: '2026-12-31',
            totalElectricity: 9000,
            monthlyElectricity: {
              [monthMay]: 900,
            },
            greenElecAllow: true,
            quoteDetails: {
              fixedPriceRatio: 100,
            },
          },
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('绿电价格必须提供');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(await contractRepository.count()).toBe(0);
    expect(await quotationRepository.count()).toBe(0);
  });
});
