import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class PartyBInput {
  @Field(() => Int, { description: '乙方主体 ID' })
  @IsInt({ message: '乙方主体 ID 必须是整数' })
  @Min(1, { message: '乙方主体 ID 必须大于 0' })
  partyBId!: number;
}
