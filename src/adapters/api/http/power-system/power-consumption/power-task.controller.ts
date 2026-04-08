import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  DomainError,
  INPUT_NORMALIZE_ERROR,
  isDomainError,
} from '@src/core/common/errors/domain-error';
import type { Response } from 'express';
import { ExecutePowerTaskUsecase } from '@usecases/power-system/power-consumption/execute-power-task.usecase';
import { QueuePowerTaskUsecase } from '@usecases/power-system/power-consumption/queue-power-task.usecase';
import type { ExecutePowerTaskRequest } from './dto/execute-power-task.request';

interface UploadedTaskFile {
  readonly originalname?: string;
  readonly buffer?: Buffer;
}

@Controller('power-system/power-consumption')
export class PowerSystemPowerTaskController {
  constructor(
    private readonly executePowerTaskUsecase: ExecutePowerTaskUsecase,
    private readonly queuePowerTaskUsecase: QueuePowerTaskUsecase,
  ) {}

  @Post('tasks')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files'))
  async executePowerTask(
    @UploadedFiles() files: UploadedTaskFile[] | undefined,
    @Body() body: ExecutePowerTaskRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.executePowerTaskUsecase.execute({
        taskName: body.taskName,
        files: (files ?? []).map((file) => ({
          originalName: file.originalname,
          buffer: file.buffer,
        })),
      });

      await this.queuePowerTaskUsecase.execute({ taskId: result.taskId });

      res.status(HttpStatus.OK).type('application/json').send(JSON.stringify(result));
      return;
    } catch (error) {
      this.writeErrorResponse(res, error);
    }
  }

  private writeErrorResponse(res: Response, error: unknown): void {
    if (isDomainError(error)) {
      const { statusCode, errorCode, message } = this.mapDomainError(error);
      res.status(statusCode).type('application/json').send(
        JSON.stringify({
          errorCode,
          message,
        }),
      );
      return;
    }

    throw new InternalServerErrorException(
      error instanceof Error ? error.message : '创建用电任务失败',
    );
  }

  private mapDomainError(error: DomainError): {
    readonly statusCode: number;
    readonly errorCode: string;
    readonly message: string;
  } {
    if (
      error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT ||
      error.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY ||
      error.code === INPUT_NORMALIZE_ERROR.OPTIONAL_TEXT_EMPTY_REJECTED ||
      error.code === INPUT_NORMALIZE_ERROR.EMPTY_LIST_REJECTED ||
      error.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: error.code,
        message: error.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: error.code,
      message: error.message,
    };
  }
}
