import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PowerPredictPort,
  type PowerPredictRequest,
} from '@src/core/power-system/power-predict.port';

interface PowerPredictResponse {
  readonly prediction?: unknown;
}

const DEFAULT_PREDICT_API_URL = 'http://221.224.90.218:8000/load_predict';
const DEFAULT_TIMEOUT_MS = 15000;

@Injectable()
export class PowerPredictHttpClient extends PowerPredictPort {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async loadPredict(input: PowerPredictRequest): Promise<readonly number[]> {
    const url =
      this.configService.get<string>('POWER_SYSTEM_PREDICT_API_URL')?.trim() ||
      DEFAULT_PREDICT_API_URL;
    const timeoutMs = normalizeTimeout(
      this.configService.get<string>('POWER_SYSTEM_PREDICT_API_TIMEOUT_MS'),
    );

    const response = await this.httpService.axiosRef.post<PowerPredictResponse>(
      url,
      {
        company_id: input.companyId,
        last_historical_date: input.lastHistoricalDate,
        historical_data: input.historicalData,
      },
      {
        timeout: timeoutMs,
      },
    );

    const prediction = response.data?.prediction;
    if (!Array.isArray(prediction)) {
      throw new Error('预测接口返回格式错误：prediction 不是数组');
    }

    return prediction.map((value, index) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`预测接口返回格式错误：prediction[${String(index)}] 不是有效数字`);
      }
      return value;
    });
  }
}

function normalizeTimeout(value: string | undefined): number {
  if (!value) {
    return DEFAULT_TIMEOUT_MS;
  }

  const timeout = Number(value);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.floor(timeout);
}
