import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ContractEntity } from '@src/modules/power-system/contract/contract.entity';
import { PartyBEntity } from '@src/modules/power-system/party-b/party-b.entity';
import { FixedPriceDetailsEntity } from '@src/modules/power-system/quotation/fixed-price-details.entity';
import { QuotationEntity } from '@src/modules/power-system/quotation/quotation.entity';
import PizZip from 'pizzip';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem contract docx (e2e)', () => {
  const monthSeptember = '2025-09';

  let app: INestApplication<App>;
  let dataSource: DataSource;
  let contractRepository: Repository<ContractEntity>;
  let partyBRepository: Repository<PartyBEntity>;
  let quotationRepository: Repository<QuotationEntity>;
  let fixedPriceDetailsRepository: Repository<FixedPriceDetailsEntity>;

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
    fixedPriceDetailsRepository = dataSource.getRepository(FixedPriceDetailsEntity);
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
    await quotationRepository.createQueryBuilder().delete().execute();
    await contractRepository.createQueryBuilder().delete().execute();
    await partyBRepository.createQueryBuilder().delete().execute();
  }

  async function seedContracts(): Promise<void> {
    await partyBRepository.save(
      partyBRepository.create({
        partyBId: 9601,
        configName: '合同文档乙方',
        companyName: '合同文档售电有限公司',
        creditCode: '913301006666666666',
        companyAddress: '杭州市文一西路 66 号',
        legalPerson: '刘总',
        contactPerson: '周经理',
        contactPhone: '13888886666',
        contactEmail: 'contract-docx-party-b@example.com',
        depositoryBank: '工商银行',
        bankAccountNo: '6222000011112222',
        hotLine: '400-666-6666',
        isDefault: true,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );

    await contractRepository.save([
      contractRepository.create({
        contractId: 9901,
        contractCurrentStatus: '已确认',
        isActive: true,
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025009901',
        partyBContractNo: 'YF2025009901',
        submissionTime: new Date('2025-09-01T10:00:00.000Z'),
        confirmationTime: new Date('2025-09-02T10:00:00.000Z'),
        contractSignDate: '2025-09-01',
        partyASignDate: '2025-09-01',
        partyBSignDate: '2025-09-02',
        orderTime: new Date('2025-09-01T15:00:00.000Z'),
        signLocation: '杭州',
        additionalTerms: '乙方应确保服务连续性。',
        disputeResolutionMethod: '2',
        filingMethod: '2',
        filingParty: '乙',
        partyBTerminationBefore30: 10,
        partyBTerminationOther: 12,
        partyBTerminationActive: 15,
        partyATerminationBefore30: 8,
        partyATerminationIn30: 9,
        partyATerminationActive: 11,
        originalCopies: 2,
        duplicateCopies: 1,
        partyACustom: true,
        partyACustomCompany: '杭州临时用电科技有限公司',
        partyACustomCreditCode: '91330100DOCX000001',
        partyACustomLegalPerson: '陈总',
        partyACustomAddress: '杭州市滨江区合同路 1 号',
        partyACustomBank: '中国银行',
        partyACustomBankAccount: '6222000099998888',
        partyACustomContactPerson: '吴经理',
        partyACustomContactPhone: '13912345678',
        partyAId: -1,
        partyBId: 9601,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      contractRepository.create({
        contractId: 9902,
        contractCurrentStatus: '已停用',
        isActive: false,
        confirmationMethod: '电子确认',
        partyAContractNo: 'JF2025009902',
        partyBContractNo: 'YF2025009902',
        submissionTime: null,
        confirmationTime: null,
        contractSignDate: '2025-09-03',
        partyASignDate: '2025-09-03',
        partyBSignDate: '2025-09-03',
        orderTime: null,
        signLocation: '宁波',
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
        partyACustomCompany: '已停用临时甲方',
        partyACustomCreditCode: null,
        partyACustomLegalPerson: null,
        partyACustomAddress: null,
        partyACustomBank: null,
        partyACustomBankAccount: null,
        partyACustomContactPerson: null,
        partyACustomContactPhone: null,
        partyAId: -1,
        partyBId: 9601,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    await quotationRepository.save(
      quotationRepository.create({
        id: 9951,
        contractId: 9901,
        quoteTypeId: 1,
        greenElecAllow: true,
        greenElecPrice: 0.05,
        tradeStartTime: '2025-09-01',
        tradeEndTime: '2025-12-31',
        totalElectricity: 12345.67,
        monthlyElectricity: {
          [monthSeptember]: 2000,
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
        id: 9961,
        quotationId: 9951,
        fixedPriceRatio: 100,
        marketTransactionPrice: 0.48,
        priceLimit: 0.55,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );
  }

  const binaryParser = (
    res: NodeJS.ReadableStream & {
      setEncoding(encoding: BufferEncoding): void;
    },
    callback: (error: Error | null, body: Buffer) => void,
  ): void => {
    const chunks: Buffer[] = [];
    res.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'binary') : chunk);
    });
    res.on('end', () => {
      callback(null, Buffer.concat(chunks));
    });
    res.on('error', (error: Error) => {
      callback(error, Buffer.alloc(0));
    });
  };

  const parseHttpJson = (response: request.Response): Record<string, unknown> => {
    if (response.body && Object.keys(response.body).length > 0) {
      return response.body as Record<string, unknown>;
    }
    return JSON.parse(response.text) as Record<string, unknown>;
  };

  const getDocumentXml = (buffer: Buffer): string => {
    const zip = new PizZip(buffer);
    return zip.file('word/document.xml')?.asText() ?? '';
  };

  it('downloads a contract docx attachment', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-system/contracts/9901/docx')
      .buffer(true)
      .parse(
        binaryParser as unknown as (
          res: unknown,
          callback: (error: Error | null, body: unknown) => void,
        ) => void,
      )
      .expect(200);

    expect(response.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(response.headers['content-disposition']).toMatch(
      /^attachment; filename="contract_9901_\d{8}_\d{6}\.docx"$/,
    );
    expect(Number(response.headers['content-length'])).toBe(response.body.length);
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(1024);
    expect(response.body.subarray(0, 2).toString('utf8')).toBe('PK');

    const documentXml = getDocumentXml(response.body);
    expect(documentXml).toContain('杭州临时用电科技有限公司');
    expect(documentXml).toContain('合同文档售电有限公司');
    expect(documentXml).toContain('9月');
    expect(documentXml).toContain('2000');
    expect(documentXml).not.toContain('{party_a_company_name}');
  });

  it('returns not found when the contract is already inactive', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-system/contracts/9902/docx')
      .expect(404);

    const body = parseHttpJson(response);
    expect(body.errorCode).toBe('POWER_SYSTEM_CONTRACT_NOT_FOUND');
    expect(body.message).toBe('合同不存在');
  });

  it('returns bad request when contract id is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/power-system/contracts/0/docx')
      .expect(400);

    const body = parseHttpJson(response);
    expect(body.errorCode).toBe('INPUT_NORMALIZE_INVALID_LIMIT_VALUE');
    expect(body.message).toBe('合同 ID 必须是大于 0 的整数');
  });
});
