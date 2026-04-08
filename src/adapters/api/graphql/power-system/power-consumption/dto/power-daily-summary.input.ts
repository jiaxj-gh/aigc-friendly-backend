import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength } from 'class-validator';

@InputType()
export class PowerDailySummaryInput {
  @Field(() => String, { description: '企业名称，传 --全部-- 表示全部企业' })
  @IsString({ message: '企业名称必须是字符串' })
  @MaxLength(255, { message: '企业名称长度不能超过 255' })
  companyName!: string;

  @Field(() => String, { description: '开始日期，格式 YYYY-MM-DD' })
  @IsString({ message: '开始日期必须是字符串' })
  startDate!: string;

  @Field(() => String, { description: '结束日期，格式 YYYY-MM-DD' })
  @IsString({ message: '结束日期必须是字符串' })
  endDate!: string;
}
