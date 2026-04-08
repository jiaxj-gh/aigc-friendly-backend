import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { initGraphQLSchema } from '@src/adapters/api/graphql/schema/schema.init';
import { ApiModule } from '@src/bootstraps/api/api.module';
import { PowerTaskSummaryEntity } from '@src/modules/power-system/power-consumption/power-task-summary.entity';
import { postGql } from '../utils/e2e-graphql-utils';
import { DataSource, Repository } from 'typeorm';

describe('PowerSystem powerTaskStatus (e2e)', () => {
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

  it('returns a full task status snapshot', async () => {
    const task = await taskSummaryRepository.save(
      taskSummaryRepository.create({
        taskName: '四月预测任务',
        status: 'computing',
        startTime: new Date('2026-04-07T08:00:00.000Z'),
        endTime: null,
        uploadSummary: {
          start_time: '2026-04-07T08:00:01.000Z',
          end_time: '2026-04-07T08:05:01.000Z',
          total_files: 2,
          uploaded_files: 1,
          failed_files: 1,
          files: [
            {
              file_id: 'file-1',
              name: 'actual_1.csv',
              size: 1234,
              status: 'completed',
              error_message: null,
            },
            {
              file_id: 'file-2',
              name: 'actual_2.csv',
              size: 5678,
              status: 'failed',
              error_message: 'CSV 解析失败',
            },
          ],
          company_dates: Object.fromEntries([
            ['苏州三星电子有限公司', ['2026-04-01', '2026-04-02']],
            ['共成（苏州）交通器材有限公司', ['2026-04-03']],
          ]),
        },
        computeSummary: {
          start_time: '2026-04-07T08:05:02.000Z',
          end_time: null,
          total_jobs: 2,
          successful_jobs: 1,
          failed_jobs: 0,
          progress: 50,
          jobs: [
            {
              company_name: '苏州三星电子有限公司',
              predicted_date: '2026-04-11',
              status: 'success',
              error_message: null,
            },
            {
              company_name: '--全部--',
              predicted_date: '2026-04-11',
              status: 'not_started',
              error_message: null,
            },
          ],
        },
        errorMessage: '部分文件上传或数据入库失败。',
        createdBy: 'seed',
        updatedBy: 'seed',
      }),
    );

    const response = await postGql({
      app,
      query: `
        query PowerTaskStatus($input: PowerTaskStatusInput!) {
          powerTaskStatus(input: $input) {
            taskId
            taskName
            status
            startTime
            endTime
            errorMessage
            upload {
              startTime
              endTime
              totalFiles
              uploadedFiles
              failedFiles
              files {
                fileId
                name
                size
                status
                errorMessage
              }
              companyDates {
                companyName
                dates
              }
            }
            compute {
              startTime
              endTime
              totalJobs
              successfulJobs
              failedJobs
              progress
              jobs {
                companyName
                predictedDate
                status
                errorMessage
              }
            }
          }
        }
      `,
      variables: {
        input: {
          taskId: task.taskId,
        },
      },
    }).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.powerTaskStatus).toEqual({
      taskId: task.taskId,
      taskName: '四月预测任务',
      status: 'computing',
      startTime: '2026-04-07T08:00:00.000Z',
      endTime: null,
      errorMessage: '部分文件上传或数据入库失败。',
      upload: {
        startTime: '2026-04-07T08:00:01.000Z',
        endTime: '2026-04-07T08:05:01.000Z',
        totalFiles: 2,
        uploadedFiles: 1,
        failedFiles: 1,
        files: [
          {
            fileId: 'file-1',
            name: 'actual_1.csv',
            size: 1234,
            status: 'completed',
            errorMessage: null,
          },
          {
            fileId: 'file-2',
            name: 'actual_2.csv',
            size: 5678,
            status: 'failed',
            errorMessage: 'CSV 解析失败',
          },
        ],
        companyDates: [
          {
            companyName: '共成（苏州）交通器材有限公司',
            dates: ['2026-04-03'],
          },
          {
            companyName: '苏州三星电子有限公司',
            dates: ['2026-04-01', '2026-04-02'],
          },
        ],
      },
      compute: {
        startTime: '2026-04-07T08:05:02.000Z',
        endTime: null,
        totalJobs: 2,
        successfulJobs: 1,
        failedJobs: 0,
        progress: 50,
        jobs: [
          {
            companyName: '--全部--',
            predictedDate: '2026-04-11',
            status: 'not_started',
            errorMessage: null,
          },
          {
            companyName: '苏州三星电子有限公司',
            predictedDate: '2026-04-11',
            status: 'success',
            errorMessage: null,
          },
        ],
      },
    });
  });

  it('returns not found when the task does not exist', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerTaskStatus($input: PowerTaskStatusInput!) {
          powerTaskStatus(input: $input) {
            taskId
          }
        }
      `,
      variables: {
        input: {
          taskId: 99999,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('任务不存在');
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
    expect(response.body.errors[0].extensions.errorCode).toBe('POWER_SYSTEM_TASK_NOT_FOUND');
  });

  it('rejects invalid task ids', async () => {
    const response = await postGql({
      app,
      query: `
        query PowerTaskStatus($input: PowerTaskStatusInput!) {
          powerTaskStatus(input: $input) {
            taskId
          }
        }
      `,
      variables: {
        input: {
          taskId: 0,
        },
      },
    }).expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('任务 ID 必须大于 0');
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
