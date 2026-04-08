import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContractPowerSupplyType {
  @Field(() => Int, { description: '供电信息 ID' })
  psId!: number;

  @Field(() => String, { description: '供电地址' })
  powerSupplyAddress!: string;

  @Field(() => String, { description: '供电户号' })
  powerSupplyNumber!: string;
}
