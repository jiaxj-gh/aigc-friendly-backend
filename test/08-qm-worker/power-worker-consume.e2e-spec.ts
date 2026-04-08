import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PowerPredictPort } from '@src/core/power-system/power-predict.port';
import { promises as fs } from 'fs';
import path from 'path';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { WorkerModule } from '@src/bootstraps/worker/worker.module';
import { BULLMQ_QUEUES } from '@src/infrastructure/bullmq/bullmq.constants';
import { BullMqWorkerRuntime } from '@src/infrastructure/bullmq/worker.runtime';
import { AsyncTaskRecordEntity } from '@src/modules/async-task-record/async-task-record.entity';
import { ForecastPowerConsumptionEntity } from '@src/modules/power-system/power-consumption/forecast-power-consumption.entity';
import { PowerTaskSummaryEntity } from '@src/modules/power-system/power-consumption/power-task-summary.entity';
import { Queue } from 'bullmq';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

describe('Power Worker consume flow (e2e)', () => {
  let apiApp: INestApplication<App>;
  let workerApp: INestApplication<App>;
  let powerQueue: Queue;
  let workerRuntime: BullMqWorkerRuntime;
  let taskSummaryRepository: Repository<PowerTaskSummaryEntity>;
  let forecastPowerConsumptionRepository: Repository<ForecastPowerConsumptionEntity>;
  let asyncTaskRecordRepository: Repository<AsyncTaskRecordEntity>;
  const predictApiClientMock: { loadPredict: jest.Mock<Promise<readonly number[]>> } = {
    loadPredict: jest.fn(),
  };
  const originalInline = process.env.POWER_SYSTEM_TASKS_INLINE;

  beforeAll(async () => {
    process.env.POWER_SYSTEM_TASKS_INLINE = 'false';
    initGraphQLSchema();

    const apiModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();
    apiApp = apiModuleFixture.createNestApplication();
    await apiApp.init();

    const workerModuleFixture: TestingModule = await Test.createTestingModule({
      imports: [WorkerModule],
    })
      .overrideProvider(PowerPredictPort)
      .useValue(predictApiClientMock)
      .compile();
    workerApp = workerModuleFixture.createNestApplication();
    await workerApp.init();

    const dataSource = apiApp.get(DataSource);
    taskSummaryRepository = dataSource.getRepository(PowerTaskSummaryEntity);
    forecastPowerConsumptionRepository = dataSource.getRepository(ForecastPowerConsumptionEntity);
    asyncTaskRecordRepository = dataSource.getRepository(AsyncTaskRecordEntity);
    powerQueue = apiApp.get<Queue>(getQueueToken(BULLMQ_QUEUES.POWER));
    workerRuntime = workerApp.get(BullMqWorkerRuntime);
  }, 60000);

  beforeEach(async () => {
    predictApiClientMock.loadPredict.mockReset();
    predictApiClientMock.loadPredict.mockResolvedValue(buildPredictionSeries());
    await clearTables();
    await clearUploads();
    await powerQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await clearTables();
    await clearUploads();
    await powerQueue.obliterate({ force: true });
    if (workerApp) {
      await workerApp.close();
    }
    if (apiApp) {
      await apiApp.close();
    }
    process.env.POWER_SYSTEM_TASKS_INLINE = originalInline;
  });

  async function clearTables(): Promise<void> {
    await asyncTaskRecordRepository.createQueryBuilder().delete().execute();
    await forecastPowerConsumptionRepository.createQueryBuilder().delete().execute();
    await taskSummaryRepository.createQueryBuilder().delete().execute();
  }

  async function clearUploads(): Promise<void> {
    await fs.rm(path.resolve(process.cwd(), 'uploads', 'power-system', 'tasks'), {
      recursive: true,
      force: true,
    });
  }

  it('API app should not expose BullMqWorkerRuntime', () => {
    expect(() => apiApp.get(BullMqWorkerRuntime)).toThrow();
  });

  it('consumes queued power task in worker and writes forecast rows', async () => {
    try {
      await workerRuntime.stop();

      const response = await request(apiApp.getHttpServer())
        .post('/power-system/power-consumption/tasks')
        .field('taskName', 'Worker消费任务')
        .attach(
          'files',
          Buffer.from(buildActualCsv('苏州三星电子有限公司', 'ACC-001', '2026-04-01', 10)),
          'actual.csv',
        )
        .expect(200);

      const taskId = response.body.taskId as number;
      expect(taskId).toBeGreaterThan(0);

      const queuedJob = await powerQueue.getJob(`power-task-${String(taskId)}`);
      expect(queuedJob).not.toBeNull();
      expect(queuedJob?.name).toBe('run-task');

      const queuedAsyncTaskRecord = await waitForAsyncTaskRecord({
        repository: asyncTaskRecordRepository,
        queueName: 'power',
        jobId: `power-task-${String(taskId)}`,
        expectedStatus: 'queued',
        timeoutMs: 10000,
        pollMs: 100,
      });
      expect(queuedAsyncTaskRecord).toMatchObject({
        traceId: `power-task-${String(taskId)}`,
        bizType: 'power_task',
        bizKey: `power-task-${String(taskId)}`,
        bizSubKey: String(taskId),
        source: 'user_action',
      });

      const taskBeforeConsume = await taskSummaryRepository.findOneByOrFail({ taskId });
      expect(taskBeforeConsume.status).toBe('computing');
      expect(taskBeforeConsume.endTime).toBeNull();

      await workerRuntime.start();

      const finalState = await waitJobFinalState({
        queue: powerQueue,
        jobId: `power-task-${String(taskId)}`,
        timeoutMs: 30000,
        pollMs: 150,
      });
      expect(finalState.state).toBe('completed');
      expect(finalState.returnvalue).toMatchObject({
        accepted: true,
        taskId,
      });

      const completedTask = await waitForTaskStatus({
        repository: taskSummaryRepository,
        taskId,
        expectedStatus: 'completed',
        timeoutMs: 30000,
        pollMs: 150,
      });
      expect(completedTask.errorMessage).toBeNull();
      expect(completedTask.endTime).toBeInstanceOf(Date);

      const completedAsyncTaskRecord = await waitForAsyncTaskRecord({
        repository: asyncTaskRecordRepository,
        queueName: 'power',
        jobId: `power-task-${String(taskId)}`,
        expectedStatus: 'succeeded',
        timeoutMs: 30000,
        pollMs: 150,
      });
      expect(completedAsyncTaskRecord).toMatchObject({
        traceId: `power-task-${String(taskId)}`,
        bizType: 'power_task',
        bizKey: `power-task-${String(taskId)}`,
        bizSubKey: String(taskId),
        source: 'user_action',
        reason: 'worker_completed',
      });
      expect(completedAsyncTaskRecord.startedAt).toBeInstanceOf(Date);
      expect(completedAsyncTaskRecord.finishedAt).toBeInstanceOf(Date);

      const forecastRows = await waitForForecastRows({
        repository: forecastPowerConsumptionRepository,
        expectedAtLeast: 10,
        timeoutMs: 30000,
        pollMs: 150,
      });
      expect(forecastRows[0]).toMatchObject({
        sellerCompanyName: '苏州中鑫新能源有限公司',
        useDate: '2026-04-01--2026-04-10',
        createdBy: 'system',
        updatedBy: 'system',
      });
      expect(predictApiClientMock.loadPredict).toHaveBeenCalled();
    } finally {
      await workerRuntime.start();
    }
  }, 60000);
});

type FinalJobState = 'completed' | 'failed';

async function waitJobFinalState(input: {
  readonly queue: Queue;
  readonly jobId: string;
  readonly timeoutMs: number;
  readonly pollMs: number;
}): Promise<{
  readonly state: FinalJobState;
  readonly returnvalue?: unknown;
  readonly failedReason?: string;
}> {
  const deadline = Date.now() + input.timeoutMs;

  while (Date.now() < deadline) {
    const job = await input.queue.getJob(input.jobId);
    if (job) {
      const state = await job.getState();
      if (state === 'completed') {
        return {
          state,
          returnvalue: job.returnvalue,
        };
      }
      if (state === 'failed') {
        return {
          state,
          failedReason: job.failedReason,
        };
      }
    }

    await sleep(input.pollMs);
  }

  throw new Error(`Power queue job ${input.jobId} did not reach a final state in time`);
}

async function waitForTaskStatus(input: {
  readonly repository: Repository<PowerTaskSummaryEntity>;
  readonly taskId: number;
  readonly expectedStatus: string;
  readonly timeoutMs: number;
  readonly pollMs: number;
}): Promise<PowerTaskSummaryEntity> {
  const deadline = Date.now() + input.timeoutMs;

  while (Date.now() < deadline) {
    const task = await input.repository.findOneBy({ taskId: input.taskId });
    if (task?.status === input.expectedStatus) {
      return task;
    }

    await sleep(input.pollMs);
  }

  throw new Error(`Power task ${String(input.taskId)} did not reach ${input.expectedStatus}`);
}

async function waitForAsyncTaskRecord(input: {
  readonly repository: Repository<AsyncTaskRecordEntity>;
  readonly queueName: string;
  readonly jobId: string;
  readonly expectedStatus: string;
  readonly timeoutMs: number;
  readonly pollMs: number;
}): Promise<AsyncTaskRecordEntity> {
  const deadline = Date.now() + input.timeoutMs;

  while (Date.now() < deadline) {
    const record = await input.repository.findOne({
      where: {
        queueName: input.queueName,
        jobId: input.jobId,
      },
      order: {
        id: 'DESC',
      },
    });
    if (record?.status === input.expectedStatus) {
      return record;
    }

    await sleep(input.pollMs);
  }

  throw new Error(
    `Async task record ${input.queueName}/${input.jobId} did not reach ${input.expectedStatus}`,
  );
}

async function waitForForecastRows(input: {
  readonly repository: Repository<ForecastPowerConsumptionEntity>;
  readonly expectedAtLeast: number;
  readonly timeoutMs: number;
  readonly pollMs: number;
}): Promise<ForecastPowerConsumptionEntity[]> {
  const deadline = Date.now() + input.timeoutMs;

  while (Date.now() < deadline) {
    const rows = await input.repository.find({
      order: {
        recordDate: 'ASC',
        retailUserName: 'ASC',
      },
    });
    if (rows.length >= input.expectedAtLeast) {
      return rows;
    }

    await sleep(input.pollMs);
  }

  throw new Error(`Forecast rows did not reach ${String(input.expectedAtLeast)} in time`);
}

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

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
