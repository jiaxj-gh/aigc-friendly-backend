import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContractBasicInfoType {
  @Field(() => Int, { description: '合同 ID' })
  contractId!: number;

  @Field(() => String, { description: '合同当前状态' })
  contractCurrentStatus!: string;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;

  @Field(() => String, { nullable: true, description: '创建人标识' })
  createdBy!: string | null;

  @Field(() => String, { nullable: true, description: '更新人标识' })
  updatedBy!: string | null;

  @Field(() => Boolean, { description: '是否有效' })
  isActive!: boolean;
}
