import { Field, ObjectType } from '@nestjs/graphql';
import { PowerDailySummaryDayType } from './power-daily-summary-day.type';

@ObjectType()
export class PowerDailySummaryType {
  @Field(() => String, { description: '企业名称' })
  companyName!: string;

  @Field(() => String, { description: '开始日期' })
  startDate!: string;

  @Field(() => String, { description: '结束日期' })
  endDate!: string;

  @Field(() => [PowerDailySummaryDayType], { description: '按日汇总电量列表' })
  days!: PowerDailySummaryDayType[];
}
