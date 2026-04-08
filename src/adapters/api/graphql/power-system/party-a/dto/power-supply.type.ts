import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerSupplyType {
  @Field(() => Int, { description: '供电信息 ID' })
  psId!: number;

  @Field(() => Int, { description: '甲方主体 ID' })
  partyAId!: number;

  @Field(() => String, { description: '供电地址' })
  powerSupplyAddress!: string;

  @Field(() => String, { description: '供电户号' })
  powerSupplyNumber!: string;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;

  @Field(() => String, { nullable: true, description: '创建人标识' })
  createdBy!: string | null;

  @Field(() => String, { nullable: true, description: '更新人标识' })
  updatedBy!: string | null;
}
