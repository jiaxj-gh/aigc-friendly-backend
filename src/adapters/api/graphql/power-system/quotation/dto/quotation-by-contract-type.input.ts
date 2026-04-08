import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, Min } from 'class-validator';

@InputType()
export class QuotationByContractTypeInput {
  @Field(() => Int, { description: '合同 ID' })
  @IsInt({ message: '合同 ID 必须是整数' })
  @Min(1, { message: '合同 ID 必须大于 0' })
  contractId!: number;

  @Field(() => Int, { description: '报价类型 ID（1 固定价格，2 比例分成，3 价差浮动）' })
  @IsInt({ message: '报价类型 ID 必须是整数' })
  @IsIn([1, 2, 3], { message: '报价类型 ID 必须为 1、2、3 之一' })
  quoteTypeId!: number;
}
