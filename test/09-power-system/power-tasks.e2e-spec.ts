import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PowerPredictPort } from '@src/core/power-system/power-predict.port';
import { promises as fs } from 'fs';
import path from 'path';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { ActualPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/actual-power-consumption.entity';
import { ForecastPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/forecast-power-consumption.entity';
import { PowerTaskSummaryEntity } from '@src/modules/power-system/power-consumption/power-task-summary.entity';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem power tasks (e2e)', () => {
  let app: INestApplication<App>;
  let taskSummaryRepository: Repository<PowerTaskSummaryEntity>;
  let actualPowerConsumptionRepository: Repository<ActualPowerConsumptionEntity>;
  let forecastPowerConsumptionRepository: Repository<ForecastPowerConsumptionEntity>;
  const predictApiClientMock: { loadPredict: jest.Mock<Promise<readonly number[]>> } = {
    loadPredict: jest.fn(),
  };
  const originalInline = process.env.POWER_SYSTEM_TASKS_INLINE;

  beforeAll(async () => {
    process.env.POWER_SYSTEM_TASKS_INLINE = 'true';
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(PowerPredictPort)
      .useValue(predictApiClientMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    taskSummaryRepository = dataSource.getRepository(PowerTaskSummaryEntity);
    actualPowerConsumptionRepository = dataSource.getRepository(ActualPowerConsumptionEntity);
    forecastPowerConsumptionRepository = dataSource.getRepository(ForecastPowerConsumptionEntity);
  });

  beforeEach(async () => {
    predictApiClientMock.loadPredict.mockReset();
    predictApiClientMock.loadPredict.mockResolvedValue(buildPredictionSeries());
    await clearTables();
    await clearUploads();
  });

  afterAll(async () => {
    await clearTables();
    await clearUploads();
    if (app) {
      await app.close();
    }
    process.env.POWER_SYSTEM_TASKS_INLINE = originalInline;
  });

  async function clearTables(): Promise<void> {
    await actualPowerConsumptionRepository.createQueryBuilder().delete().execute();
    await forecastPowerConsumptionRepository.createQueryBuilder().delete().execute();
    await taskSummaryRepository.createQueryBuilder().delete().execute();
  }

  async function clearUploads(): Promise<void> {
    await fs.rm(path.resolve(process.cwd(), 'uploads', 'power-system', 'tasks'), {
      recursive: true,
      force: true,
    });
  }

  it('creates a power task, ingests csv rows, and executes forecast jobs', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/power-consumption/tasks')
      .field('taskName', '四月预测任务')
      .attach(
        'files',
        Buffer.from(buildActualCsv('苏州三星电子有限公司', 'ACC-001', '2026-04-01', 10)),
        'actual.csv',
      )
      .expect(200);

    expect(response.body).toEqual({
      taskId: expect.any(Number),
      uploadReport: '文件 actual.csv: 状态 completed',
    });

    const task = await taskSummaryRepository.findOneByOrFail({
      taskId: response.body.taskId as number,
    });

    expect(task.taskName).toBe('四月预测任务');
    expect(task.status).toBe('completed');
    expect(task.errorMessage).toBeNull();
    expect(task.endTime).not.toBeNull();
    expect(task.uploadSummary).toMatchObject({
      total_files: 1,
      uploaded_files: 1,
      failed_files: 0,
      company_dates: {
        苏州三星电子有限公司: [
          '2026-04-01',
          '2026-04-02',
          '2026-04-03',
          '2026-04-04',
          '2026-04-05',
          '2026-04-06',
          '2026-04-07',
          '2026-04-08',
          '2026-04-09',
          '2026-04-10',
        ],
      },
    });
    expect(task.computeSummary).toMatchObject({
      total_jobs: 10,
      successful_jobs: 10,
      failed_jobs: 0,
      progress: 100,
      end_time: expect.any(String),
    });
    expect(Array.isArray((task.computeSummary as { jobs?: unknown }).jobs)).toBe(true);
    expect(((task.computeSummary as { jobs?: unknown[] }).jobs ?? []).length).toBe(10);
    expect(
      ((task.computeSummary as { jobs?: Array<{ status?: string }> }).jobs ?? []).every(
        (job) => job.status === 'success',
      ),
    ).toBe(true);

    const actualRows = await actualPowerConsumptionRepository.find({
      where: {
        retailUserName: '苏州三星电子有限公司',
      },
      order: {
        recordDate: 'ASC',
      },
    });

    expect(actualRows).toHaveLength(10);
    expect(actualRows[0]).toMatchObject({
      sellerCompanyName: '测试售电公司',
      retailUserName: '苏州三星电子有限公司',
      accountNumber: 'ACC-001',
      recordDate: '2026-04-01',
      dailyTotalEnergyKwh: 1.25,
      createdBy: 'admin',
      updatedBy: 'admin',
    });

    const forecastRows = await forecastPowerConsumptionRepository.find({
      order: {
        recordDate: 'ASC',
        retailUserName: 'ASC',
      },
    });

    expect(forecastRows).toHaveLength(10);
    expect(forecastRows[0]).toMatchObject({
      sellerCompanyName: '苏州中鑫新能源有限公司',
      retailUserName: '--全部--',
      recordDate: '2026-04-11',
      useDate: '2026-04-01--2026-04-10',
      dailyTotalEnergyKwh: 4656,
      createdBy: 'system',
      updatedBy: 'system',
    });
    expect((forecastRows[0] as unknown as { consumption0015?: number }).consumption0015).toBe(1);
    expect((forecastRows[0] as unknown as { consumption2400?: number }).consumption2400).toBe(96);
  });

  it('rejects requests without files', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/power-consumption/tasks')
      .field('taskName', '空上传任务')
      .expect(400);

    expect(response.body).toEqual({
      errorCode: 'INPUT_NORMALIZE_EMPTY_LIST_REJECTED',
      message: '至少上传一个CSV文件',
    });
  });

  it('creates a task but marks unsupported file types as failed', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/power-consumption/tasks')
      .field('taskName', '错误文件任务')
      .attach('files', Buffer.from('not a csv'), 'invalid.txt')
      .expect(200);

    expect(response.body).toEqual({
      taskId: expect.any(Number),
      uploadReport: '文件 invalid.txt: 状态 failed, 错误信息: 不支持的文件类型',
    });

    const task = await taskSummaryRepository.findOneByOrFail({
      taskId: response.body.taskId as number,
    });

    expect(task.status).toBe('completed');
    expect(task.errorMessage).toBe(
      '部分文件上传或数据入库失败。上传数据不足，未能启动新的预测任务。',
    );
    expect(task.endTime).not.toBeNull();
    expect(task.uploadSummary).toMatchObject({
      total_files: 1,
      uploaded_files: 0,
      failed_files: 1,
      company_dates: {},
    });
    expect(task.computeSummary).toMatchObject({
      total_jobs: 0,
      successful_jobs: 0,
      failed_jobs: 0,
      progress: 0,
      jobs: [],
    });

    expect(await actualPowerConsumptionRepository.count()).toBe(0);
    expect(await forecastPowerConsumptionRepository.count()).toBe(0);
  });

  it('records failed compute jobs when the predict api fails for aggregated jobs', async () => {
    predictApiClientMock.loadPredict.mockImplementation((input) => {
      if (input.companyId === '总和') {
        throw new Error('预测接口不可用');
      }

      return Promise.resolve(buildPredictionSeries());
    });

    const response = await request(app.getHttpServer())
      .post('/power-system/power-consumption/tasks')
      .field('taskName', '部分失败任务')
      .attach(
        'files',
        Buffer.from(buildActualCsv('苏州三星电子有限公司', 'ACC-001', '2026-04-01', 10)),
        'actual.csv',
      )
      .expect(200);

    const task = await taskSummaryRepository.findOneByOrFail({
      taskId: response.body.taskId as number,
    });

    expect(task.status).toBe('completed');
    expect(task.errorMessage).toBe('部分计算任务执行失败。');
    expect(task.computeSummary).toMatchObject({
      total_jobs: 10,
      successful_jobs: 5,
      failed_jobs: 5,
      progress: 100,
    });

    const jobs = ((task.computeSummary as { jobs?: unknown[] }).jobs ?? []) as Array<{
      company_name?: string;
      status?: string;
      error_message?: string | null;
    }>;
    expect(
      jobs.filter((job) => job.company_name === '--全部--' && job.status === 'failed'),
    ).toHaveLength(5);
    expect(jobs.some((job) => job.error_message === '预测接口不可用')).toBe(true);
    expect(await forecastPowerConsumptionRepository.count()).toBe(5);
  });
});

function buildActualCsv(
  companyName: string,
  accountNumber: string,
  startDate: string,
  days: number,
): string {
  const rows = ['售电公司名称,零售用户名,户号,日期,00:15'];
  const baseDate = new Date(`${startDate}T00:00:00.000Z`);

  for (let index = 0; index < days; index += 1) {
    const date = new Date(baseDate);
    date.setUTCDate(date.getUTCDate() + index);
    rows.push(
      ['测试售电公司', companyName, accountNumber, date.toISOString().slice(0, 10), '1.25'].join(
        ',',
      ),
    );
  }

  return rows.join('\n');
}

function buildPredictionSeries(): readonly number[] {
  return Array.from({ length: 96 * 5 }, (_, index) => index + 1);
}
