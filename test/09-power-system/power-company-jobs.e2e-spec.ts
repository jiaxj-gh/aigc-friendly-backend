import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PowerTaskSummaryEntity } from '@src/modules/power-system/power-consumption/power-task-summary.entity';
import { postGql } from '../utils/e2e-graphql-utils';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem powerCompanyJobs (e2e)', () => {
  let app: INestApplication;
  let taskSummaryRepository: Repository<PowerTaskSummaryEntity>;

  beforeAll(async () => {
    initGraphQLSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    taskSummaryRepository = dataSource.getRepository(PowerTaskSummaryEntity);
  });

  beforeEach(async () => {
    await taskSummaryRepository.clear();
  });

  afterAll(async () => {
    await taskSummaryRepository.clear();
    if (app) {
      await app.close();
    }
  });

  it('returns matched company jobs from computing tasks and marks in-progress correctly', async () => {
    await taskSummaryRepository.save([
      taskSummaryRepository.create({
        taskName: '任务一',
        status: 'computing',
        startTime: new Date('2026-04-07T08:00:00.000Z'),
        endTime: null,
        uploadSummary: {},
        computeSummary: {
          jobs: [
            {
              company_name: '苏州三星电子有限公司',
              predicted_date: '2026-04-10',
              status: 'success',
              error_message: null,
            },
            {
              company_name: '苏州三星电子有限公司',
              predicted_date: '2026-04-09',
              status: 'not_started',
              error_message: null,
            },
            {
              company_name: '其他公司',
              predicted_date: '2026-04-11',
              status: 'failed',
              error_message: '忽略',
            },
          ],
        },
        errorMessage: null,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
      taskSummaryRepository.create({
        taskName: '任务二',
        status: 'completed',
        startTime: new Date('2026-04-07T09:00:00.000Z'),
        endTime: new Date('2026-04-07T10:00:00.000Z'),
        uploadSummary: {},
        computeSummary: {
          jobs: [
            {
              company_name: '苏州三星电子有限公司',
              predicted_date: '2026-04-08',
              status: 'success',
              error_message: null,
            },
          ],
        },
        errorMessage: null,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerCompanyJobs($input: PowerCompanyJobsInput!) {
          powerCompanyJobs(input: $input) {
            companyName
            inProgress
            jobs {
              taskId
              taskName
              predictedDate
              status
              errorMessage
            }
          }
        }
      `,
      variables: {
        input: {
          companyName: '苏州三星电子有限公司',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerCompanyJobs.companyName).toBe('苏州三星电子有限公司');
    expect(response.body.data.powerCompanyJobs.inProgress).toBe(true);
    expect(response.body.data.powerCompanyJobs.jobs).toEqual([
      {
        taskId: expect.any(Number),
        taskName: '任务一',
        predictedDate: '2026-04-09',
        status: 'not_started',
        errorMessage: null,
      },
      {
        taskId: expect.any(Number),
        taskName: '任务一',
        predictedDate: '2026-04-10',
        status: 'success',
        errorMessage: null,
      },
    ]);
  });

  it('returns an empty job list when there is no matched computing task job', async () => {
    await taskSummaryRepository.save([
      taskSummaryRepository.create({
        taskName: '任务一',
        status: 'computing',
        startTime: new Date('2026-04-07T08:00:00.000Z'),
        endTime: null,
        uploadSummary: {},
        computeSummary: {
          jobs: [
            {
              company_name: '其他公司',
              predicted_date: '2026-04-10',
              status: 'success',
              error_message: null,
            },
            {
              company_name: '苏州三星电子有限公司',
              predicted_date: '2026/04/10',
              status: 'success',
              error_message: null,
            },
          ],
        },
        errorMessage: null,
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    ]);

    const response = await postGql({
      app,
      query: `
        query PowerCompanyJobs($input: PowerCompanyJobsInput!) {
          powerCompanyJobs(input: $input) {
            companyName
            inProgress
            jobs {
              taskId
            }
          }
        }
      `,
      variables: {
        input: {
          companyName: '苏州三星电子有限公司',
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerCompanyJobs).toEqual({
      companyName: '苏州三星电子有限公司',
      inProgress: false,
      jobs: [],
    });
  });

  it('rejects blank company names', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerCompanyJobs($input: PowerCompanyJobsInput!) {
          powerCompanyJobs(input: $input) {
            companyName
          }
        }
      `,
      variables: {
        input: {
          companyName: '   ',
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('公司名称不能为空');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
