import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class ContractInput {
  @Field(() => Int, { description: '合同 ID' })
  @IsInt({ message: '合同 ID 必须是整数' })
  @Min(1, { message: '合同 ID 必须大于 0' })
  contractId!: number;
}
