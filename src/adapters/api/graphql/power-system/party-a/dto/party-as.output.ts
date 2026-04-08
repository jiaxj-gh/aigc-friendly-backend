import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PartyAType } from './party-a.type';

@ObjectType()
export class PartyAsOutput {
  @Field(() => [PartyAType], { description: '甲方主体列表' })
  items!: PartyAType[];

  @Field(() => Int, { description: '总数量' })
  total!: number;
}
