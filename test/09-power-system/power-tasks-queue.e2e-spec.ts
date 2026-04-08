import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import path from 'path';
import { Queue } from 'bullmq';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { BULLMQ_QUEUES } from '@src/infrastructure/bullmq/bullmq.constants';
import { PowerTaskSummaryEntity } from '@src/modules/power-system/power-consumption/power-task-summary.entity';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem power tasks queue path (e2e)', () => {
  let app: INestApplication<App>;
  let taskSummaryRepository: Repository<PowerTaskSummaryEntity>;
  let powerQueue: Queue;
  const originalInline = process.env.POWER_SYSTEM_TASKS_INLINE;

  beforeAll(async () => {
    process.env.POWER_SYSTEM_TASKS_INLINE = 'false';
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    taskSummaryRepository = dataSource.getRepository(PowerTaskSummaryEntity);
    powerQueue = moduleFixture.get<Queue>(getQueueToken(BULLMQ_QUEUES.POWER));
  });

  beforeEach(async () => {
    await clearTables();
    await clearUploads();
    await powerQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await clearTables();
    await clearUploads();
    await powerQueue.obliterate({ force: true });
    if (app) {
      await app.close();
    }
    process.env.POWER_SYSTEM_TASKS_INLINE = originalInline;
  });

  async function clearTables(): Promise<void> {
    await taskSummaryRepository.createQueryBuilder().delete().execute();
  }

  async function clearUploads(): Promise<void> {
    await fs.rm(path.resolve(process.cwd(), 'uploads', 'power-system', 'tasks'), {
      recursive: true,
      force: true,
    });
  }

  it('enqueues the compute pipeline into bullmq when inline mode is disabled', async () => {
    const response = await request(app.getHttpServer())
      .post('/power-system/power-consumption/tasks')
      .field('taskName', '排队任务')
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
    expect(task.status).toBe('computing');
    expect(task.endTime).toBeNull();

    const queuedJob = await powerQueue.getJob(`power-task-${String(response.body.taskId)}`);
    expect(queuedJob).not.toBeNull();
    expect(queuedJob?.name).toBe('run-task');
    expect(queuedJob?.data).toMatchObject({
      taskId: response.body.taskId,
      traceId: `power-task-${String(response.body.taskId)}`,
    });
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
