import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Query,
  Res,
} from '@nestjs/common';
import {
  DomainError,
  INPUT_NORMALIZE_ERROR,
  isDomainError,
  POWER_SYSTEM_ERROR,
  TIME_ERROR,
} from '@src/core/common/errors/domain-error';
import type { Response } from 'express';
import { GeneratePowerReportUsecase } from '@usecases/power-system/power-consumption/generate-power-report.usecase';
import type { GeneratePowerReportRequest } from './dto/generate-power-report.request';

@Controller('power-system/power-consumption')
export class PowerSystemPowerReportController {
  constructor(private readonly generatePowerReportUsecase: GeneratePowerReportUsecase) {}

  @Get('report')
  async generateReport(
    @Query() query: GeneratePowerReportRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.generatePowerReportUsecase.execute(query);
      const encodedFileName = encodeURIComponent(result.fileName);

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
      res.setHeader('Content-Length', String(result.contentLength));
      res.status(HttpStatus.OK).send(result.buffer);
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
      error instanceof Error ? error.message : '生成预测报告失败',
    );
  }

  private mapDomainError(input: DomainError): {
    readonly statusCode: number;
    readonly errorCode: string;
    readonly message: string;
  } {
    if (
      input.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT ||
      input.code === INPUT_NORMALIZE_ERROR.REQUIRED_TEXT_EMPTY ||
      input.code === TIME_ERROR.INVALID_TIME_INPUT ||
      input.code === TIME_ERROR.INVALID_TIME_RANGE_ORDER
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: input.code,
        message: input.message,
      };
    }

    if (input.code === POWER_SYSTEM_ERROR.REPORT_NOT_FOUND) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: input.code,
        message: input.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: input.code,
      message: input.message,
    };
  }
}
