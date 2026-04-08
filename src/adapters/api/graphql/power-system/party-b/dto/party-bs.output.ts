import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PartyBType } from './party-b.type';

@ObjectType()
export class PartyBsOutput {
  @Field(() => [PartyBType], { description: '乙方主体列表' })
  items!: PartyBType[];

  @Field(() => Int, { description: '总数量' })
  total!: number;
}
