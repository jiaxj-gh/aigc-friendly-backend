import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerDailySummaryDayType {
  @Field(() => String, { description: '汇总日期' })
  summaryDate!: string;

  @Field(() => Float, { nullable: true, description: '实际总电量 (kWh)' })
  actualEnergyKwh!: number | null;

  @Field(() => Float, { nullable: true, description: '预测总电量 (kWh)' })
  forecastEnergyKwh!: number | null;

  @Field(() => Float, { nullable: true, description: '预测偏差 (%)' })
  forecastDeviation!: number | null;
}
