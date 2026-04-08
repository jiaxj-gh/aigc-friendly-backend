import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { FixedPriceDetailsEntity } from '@src/modules/power-system/quotation/fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from '@src/modules/power-system/quotation/price-difference-details.entity';
import { QuotationEntity } from '@src/modules/power-system/quotation/quotation.entity';
import { ProportionSharingDetailsEntity } from '@src/modules/power-system/quotation/proportion-sharing-details.entity';
import { DataSource, Repository } from 'typeorm';
import { postGql } from '../utils/e2e-graphql-utils';

describe('PowerSystem quotationByContractType (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
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
    quotationRepository = dataSource.getRepository(QuotationEntity);
    fixedPriceDetailsRepository = dataSource.getRepository(FixedPriceDetailsEntity);
    proportionSharingDetailsRepository = dataSource.getRepository(ProportionSharingDetailsEntity);
    priceDifferenceDetailsRepository = dataSource.getRepository(PriceDifferenceDetailsEntity);
  });

  beforeEach(async () => {
    await clearQuotationTables();
    await seedQuotations();
  });

  afterAll(async () => {
    await clearQuotationTables();
    if (app) {
      await app.close();
    }
  });

  async function clearQuotationTables(): Promise<void> {
    await fixedPriceDetailsRepository.createQueryBuilder().delete().execute();
    await proportionSharingDetailsRepository.createQueryBuilder().delete().execute();
    await priceDifferenceDetailsRepository.createQueryBuilder().delete().execute();
    await quotationRepository.createQueryBuilder().delete().execute();
  }

  async function seedQuotations(): Promise<void> {
    await quotationRepository.save([
      quotationRepository.create({
        id: 4101,
        contractId: 5101,
        quoteTypeId: 1,
        greenElecAllow: true,
        greenElecPrice: 8.88,
        tradeStartTime: '2025-01-01',
        tradeEndTime: '2025-12-31',
        totalElectricity: 1200.5,
        monthlyElectricity: { ['2025-01']: 100.5, ['2025-02']: 99.5 },
        electricityDeviation: 5.5,
        positiveDeviationRatio: 2.2,
        positiveDeviationPrice: 0.45,
        negativeDeviationRatio: 1.8,
        negativeDeviationPrice: 0.35,
        standardCurveMethod: true,
        curveModifyDays: 3,
        curveDeviation: 1.2,
        curvePositiveRatio: 0.8,
        curvePositivePrice: 0.22,
        curveNegativeRatio: 0.5,
        curveNegativePrice: 0.18,
      }),
      quotationRepository.create({
        id: 4102,
        contractId: 5102,
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
      }),
    ]);

    await fixedPriceDetailsRepository.save(
      fixedPriceDetailsRepository.create({
        id: 6101,
        quotationId: 4101,
        fixedPriceRatio: 100,
        marketTransactionPrice: 398.12,
        priceLimit: 430.56,
      }),
    );

    await proportionSharingDetailsRepository.save(
      proportionSharingDetailsRepository.create({
        id: 6201,
        quotationId: 4102,
        psPropSharingRatio: 85,
        psDistRefPrice: 12.34,
        psLongTermTransRatio: 60,
        psPartyAPropBelowLongTerm: 30,
        psPartyBPropBelowLongTerm: 70,
        psPartyAPropAboveLongTerm: 35,
        psPartyBPropAboveLongTerm: 65,
        psMonthlyBidRatio: 20,
        psPartyAPropBelowMonthlyBid: 40,
        psPartyBPropBelowMonthlyBid: 60,
        psPartyAPropAboveMonthlyBid: 45,
        psPartyBPropAboveMonthlyBid: 55,
        psAgentProcRatio: 10,
        psPartyAPropBelowAgentProc: 50,
        psPartyBPropBelowAgentProc: 50,
        psPartyAPropAboveAgentProc: 55,
        psPartyBPropAboveAgentProc: 45,
        psIntraMonthRatio: 10,
        psPartyAPropBelowIntraMonth: 60,
        psPartyBPropBelowIntraMonth: 40,
        psPartyAPropAboveIntraMonth: 65,
        psPartyBPropAboveIntraMonth: 35,
        psLongTermTransLimit: 420,
        psMonthlyBidLimit: 430,
        psAgentProcLimit: 440,
        psIntraMonthLimit: 450,
      }),
    );
  }

  it('returns a quotation by contract id and quote type', async () => {
    const response = await postGql({
      app,
      query: `
        query QuotationByContractType($input: QuotationByContractTypeInput!) {
          quotationByContractType(input: $input) {
            id
            contractId
            quoteTypeId
            quoteType
            greenElecAllow
            greenElecPrice
            tradeStartTime
            tradeEndTime
            totalElectricity
            monthlyElectricity
            quoteDetails
          }
        }
      `,
      variables: {
        input: {
          contractId: 5101,
          quoteTypeId: 1,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.quotationByContractType).toMatchObject({
      id: 4101,
      contractId: 5101,
      quoteTypeId: 1,
      quoteType: '固定价格',
      greenElecAllow: true,
      greenElecPrice: 8.88,
      tradeStartTime: '2025-01-01',
      tradeEndTime: '2025-12-31',
      totalElectricity: 1200.5,
      monthlyElectricity: {
        ['2025-01']: 100.5,
        ['2025-02']: 99.5,
      },
      quoteDetails: {
        fixed_price_ratio: 100,
        market_transaction_price: 398.12,
        price_limit: 430.56,
      },
    });
  });

  it('returns null when the quotation is not found', async () => {
    const response = await postGql({
      app,
      query: `
        query QuotationByContractType($input: QuotationByContractTypeInput!) {
          quotationByContractType(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          contractId: 5999,
          quoteTypeId: 3,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.quotationByContractType).toBeNull();
  });

  it('rejects an invalid quote type id', async () => {
    const response = await postGql({
      app,
      query: `
        query QuotationByContractType($input: QuotationByContractTypeInput!) {
          quotationByContractType(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          contractId: 5101,
          quoteTypeId: 4,
        },
      },
    }).expect(200);

    expect(response.body.data.quotationByContractType).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('报价类型 ID 必须为 1、2、3 之一');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
