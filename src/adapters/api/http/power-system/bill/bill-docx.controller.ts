import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';
import {
  DomainError,
  INPUT_NORMALIZE_ERROR,
  isDomainError,
} from '@src/core/common/errors/domain-error';
import type { Response } from 'express';
import { GenerateBillDocxUsecase } from '@usecases/power-system/bill/generate-bill-docx.usecase';
import type { GenerateBillDocxRequest } from './dto/generate-bill-docx.request';

@Controller('power-system/bills')
export class PowerSystemBillDocxController {
  constructor(private readonly generateBillDocxUsecase: GenerateBillDocxUsecase) {}

  @Post('docx')
  async generateBillDocx(
    @Body() body: GenerateBillDocxRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.generateBillDocxUsecase.execute(body);
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
      error instanceof Error ? error.message : '生成报价单文档失败',
    );
  }

  private mapDomainError(input: DomainError): {
    readonly statusCode: number;
    readonly errorCode: string;
    readonly message: string;
  } {
    if (
      input.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT ||
      input.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST ||
      input.code === INPUT_NORMALIZE_ERROR.INVALID_TEXT_LIST_ITEM
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
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
