import { Field, ObjectType } from '@nestjs/graphql';
import { PowerIntervalSummaryPointType } from './power-interval-summary-point.type';

@ObjectType()
export class PowerIntervalSummaryType {
  @Field(() => String, { description: '企业名称' })
  companyName!: string;

  @Field(() => String, { description: '开始日期' })
  startDate!: string;

  @Field(() => String, { description: '结束日期' })
  endDate!: string;

  @Field(() => [PowerIntervalSummaryPointType], { description: '15 分钟汇总点位列表' })
  points!: PowerIntervalSummaryPointType[];

  @Field(() => Boolean, { description: '是否需要补传实际数据' })
  needUpload!: boolean;

  @Field(() => String, { description: '预测数据缺失说明' })
  forecastReport!: string;
}
