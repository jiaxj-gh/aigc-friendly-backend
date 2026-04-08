import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Res,
} from '@nestjs/common';
import {
  DomainError,
  INPUT_NORMALIZE_ERROR,
  POWER_SYSTEM_ERROR,
  isDomainError,
} from '@src/core/common/errors/domain-error';
import { Response } from 'express';
import { GenerateContractDocxUsecase } from '@usecases/power-system/contract/generate-contract-docx.usecase';

@Controller('power-system/contracts')
export class PowerSystemContractDocxController {
  constructor(private readonly generateContractDocxUsecase: GenerateContractDocxUsecase) {}

  @Get(':contractId/docx')
  async getContractDocx(
    @Param('contractId') contractId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.generateContractDocxUsecase.execute({
        contractId: Number(contractId),
      });

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
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
      error instanceof Error ? error.message : '生成合同文档失败',
    );
  }

  private mapDomainError(input: DomainError): {
    readonly statusCode: number;
    readonly errorCode: string;
    readonly message: string;
  } {
    if (input.code === POWER_SYSTEM_ERROR.CONTRACT_NOT_FOUND) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: input.code,
        message: input.message,
      };
    }

    if (input.code === INPUT_NORMALIZE_ERROR.INVALID_LIMIT_VALUE) {
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
