import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

@InputType()
export class ContractsInput {
  @Field(() => Int, { nullable: true, description: '甲方 ID 过滤条件' })
  @IsOptional()
  @IsInt({ message: '甲方 ID 必须是整数' })
  partyAId?: number;

  @Field(() => Int, { nullable: true, defaultValue: 1, description: '页码' })
  @IsOptional()
  @IsInt({ message: '页码 必须是整数' })
  @Min(1, { message: '页码 必须大于 0' })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20, description: '每页数量' })
  @IsOptional()
  @IsInt({ message: '每页数量 必须是整数' })
  @Min(1, { message: '每页数量 必须大于 0' })
  @Max(100, { message: '每页数量 不能超过 100' })
  pageSize?: number;
}
