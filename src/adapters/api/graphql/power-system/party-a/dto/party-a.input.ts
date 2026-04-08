import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class PartyAInput {
  @Field(() => Int, { description: '甲方主体 ID' })
  @IsInt({ message: '甲方主体 ID 必须是整数' })
  @Min(1, { message: '甲方主体 ID 必须大于 0' })
  partyAId!: number;
}
