import GraphQLJSON from 'graphql-type-json';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateContractQuotationInput {
  @Field(() => Int, { nullable: true, description: '报价类型 ID' })
  @IsOptional()
  @IsNumber({}, { message: '报价类型 ID 必须是数字' })
  quoteTypeId?: number;

  @Field(() => String, { nullable: true, description: '交易开始日期' })
  @IsOptional()
  @IsString({ message: '交易开始日期必须是字符串' })
  tradeStartTime?: string;

  @Field(() => String, { nullable: true, description: '交易结束日期' })
  @IsOptional()
  @IsString({ message: '交易结束日期必须是字符串' })
  tradeEndTime?: string;

  @Field(() => Float, { nullable: true, description: '预计总电量' })
  @IsOptional()
  @IsNumber({}, { message: '预计总电量必须是数字' })
  totalElectricity?: number;

  @Field(() => GraphQLJSON, { nullable: true, description: '月度电量 JSON' })
  @IsOptional()
  @IsObject({ message: '月度电量必须是对象' })
  monthlyElectricity?: Record<string, number>;

  @Field(() => Boolean, { nullable: true, description: '是否允许绿电' })
  @IsOptional()
  @IsBoolean({ message: '是否允许绿电必须是布尔值' })
  greenElecAllow?: boolean;

  @Field(() => Float, { nullable: true, description: '绿电价格' })
  @IsOptional()
  @IsNumber({}, { message: '绿电价格必须是数字' })
  greenElecPrice?: number;

  @Field(() => Float, { nullable: true, description: '电量偏差' })
  @IsOptional()
  @IsNumber({}, { message: '电量偏差必须是数字' })
  electricityDeviation?: number;

  @Field(() => Float, { nullable: true, description: '正偏差比例' })
  @IsOptional()
  @IsNumber({}, { message: '正偏差比例必须是数字' })
  positiveDeviationRatio?: number;

  @Field(() => Float, { nullable: true, description: '正偏差价格' })
  @IsOptional()
  @IsNumber({}, { message: '正偏差价格必须是数字' })
  positiveDeviationPrice?: number;

  @Field(() => Float, { nullable: true, description: '负偏差比例' })
  @IsOptional()
  @IsNumber({}, { message: '负偏差比例必须是数字' })
  negativeDeviationRatio?: number;

  @Field(() => Float, { nullable: true, description: '负偏差价格' })
  @IsOptional()
  @IsNumber({}, { message: '负偏差价格必须是数字' })
  negativeDeviationPrice?: number;

  @Field(() => Boolean, { nullable: true, description: '是否标准曲线方式' })
  @IsOptional()
  @IsBoolean({ message: '是否标准曲线方式必须是布尔值' })
  standardCurveMethod?: boolean;

  @Field(() => Int, { nullable: true, description: '曲线修正天数' })
  @IsOptional()
  @IsNumber({}, { message: '曲线修正天数必须是数字' })
  curveModifyDays?: number;

  @Field(() => Float, { nullable: true, description: '曲线偏差' })
  @IsOptional()
  @IsNumber({}, { message: '曲线偏差必须是数字' })
  curveDeviation?: number;

  @Field(() => Float, { nullable: true, description: '曲线正偏差比例' })
  @IsOptional()
  @IsNumber({}, { message: '曲线正偏差比例必须是数字' })
  curvePositiveRatio?: number;

  @Field(() => Float, { nullable: true, description: '曲线正偏差价格' })
  @IsOptional()
  @IsNumber({}, { message: '曲线正偏差价格必须是数字' })
  curvePositivePrice?: number;

  @Field(() => Float, { nullable: true, description: '曲线负偏差比例' })
  @IsOptional()
  @IsNumber({}, { message: '曲线负偏差比例必须是数字' })
  curveNegativeRatio?: number;

  @Field(() => Float, { nullable: true, description: '曲线负偏差价格' })
  @IsOptional()
  @IsNumber({}, { message: '曲线负偏差价格必须是数字' })
  curveNegativePrice?: number;

  @Field(() => GraphQLJSON, { nullable: true, description: '报价详情 JSON' })
  @IsOptional()
  @IsObject({ message: '报价详情必须是对象' })
  quoteDetails?: Record<string, boolean | number | null>;
}
