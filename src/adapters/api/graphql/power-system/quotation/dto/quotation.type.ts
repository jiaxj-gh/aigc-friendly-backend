import GraphQLJSON from 'graphql-type-json';
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuotationType {
  @Field(() => Int, { description: '报价 ID' })
  id!: number;

  @Field(() => Int, { description: '合同 ID' })
  contractId!: number;

  @Field(() => Int, { description: '报价类型 ID' })
  quoteTypeId!: number;

  @Field(() => String, { description: '报价类型名称' })
  quoteType!: string;

  @Field(() => Boolean, { description: '是否允许绿电' })
  greenElecAllow!: boolean;

  @Field(() => Float, { nullable: true, description: '绿电价格' })
  greenElecPrice!: number | null;

  @Field(() => String, { description: '交易开始日期' })
  tradeStartTime!: string;

  @Field(() => String, { description: '交易结束日期' })
  tradeEndTime!: string;

  @Field(() => Float, { description: '总电量' })
  totalElectricity!: number;

  @Field(() => GraphQLJSON, { description: '月度电量 JSON' })
  monthlyElectricity!: Record<string, number>;

  @Field(() => Float, { nullable: true, description: '电量偏差' })
  electricityDeviation!: number | null;

  @Field(() => Float, { nullable: true, description: '正偏差比例' })
  positiveDeviationRatio!: number | null;

  @Field(() => Float, { nullable: true, description: '正偏差价格' })
  positiveDeviationPrice!: number | null;

  @Field(() => Float, { nullable: true, description: '负偏差比例' })
  negativeDeviationRatio!: number | null;

  @Field(() => Float, { nullable: true, description: '负偏差价格' })
  negativeDeviationPrice!: number | null;

  @Field(() => Boolean, { description: '是否标准曲线方式' })
  standardCurveMethod!: boolean;

  @Field(() => Int, { nullable: true, description: '曲线修正天数' })
  curveModifyDays!: number | null;

  @Field(() => Float, { nullable: true, description: '曲线偏差' })
  curveDeviation!: number | null;

  @Field(() => Float, { nullable: true, description: '曲线正偏差比例' })
  curvePositiveRatio!: number | null;

  @Field(() => Float, { nullable: true, description: '曲线正偏差价格' })
  curvePositivePrice!: number | null;

  @Field(() => Float, { nullable: true, description: '曲线负偏差比例' })
  curveNegativeRatio!: number | null;

  @Field(() => Float, { nullable: true, description: '曲线负偏差价格' })
  curveNegativePrice!: number | null;

  @Field(() => GraphQLJSON, { description: '报价详情 JSON' })
  quoteDetails!: Record<string, boolean | number | null>;
}
