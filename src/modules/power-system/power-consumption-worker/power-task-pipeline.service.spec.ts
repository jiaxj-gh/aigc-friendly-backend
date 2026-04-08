import { PowerPredictPort } from '@src/core/power-system/power-predict.port';
import { PowerTaskPipelineService } from './power-task-pipeline.service';

describe('PowerTaskPipelineService', () => {
  it('finalizes the task when a fatal pipeline error happens before job execution', async () => {
    const powerConsumptionService = {
      getTaskSummaryOrThrow: jest.fn().mockResolvedValue({
        taskId: 12,
        computeSummary: {
          jobs: [
            {
              company_name: '苏州三星电子有限公司',
              predicted_date: '2026-04-11',
              status: 'not_started',
            },
          ],
        },
      }),
      saveTaskSummary: jest.fn().mockRejectedValue(new Error('db_down')),
      finalizeTaskPipelineWithFatalError: jest.fn().mockResolvedValue(undefined),
    };
    const powerPredictApiClient = {
      loadPredict: jest.fn(),
    };

    const service = new PowerTaskPipelineService(
      powerConsumptionService as never,
      powerPredictApiClient as unknown as PowerPredictPort,
    );

    await expect(service.run({ taskId: 12 })).rejects.toThrow('db_down');

    expect(powerConsumptionService.finalizeTaskPipelineWithFatalError).toHaveBeenCalledWith({
      taskId: 12,
      message: 'db_down',
      occurredAt: expect.any(Date),
    });
  });
});
