import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContractListItemType {
  @Field(() => Int, { description: '合同 ID' })
  contractId!: number;

  @Field(() => String, { description: '甲方合同编号' })
  partyAContractNo!: string;

  @Field(() => String, { description: '乙方合同编号' })
  partyBContractNo!: string;

  @Field(() => String, { description: '合同当前状态' })
  contractCurrentStatus!: string;

  @Field(() => String, { nullable: true, description: '合同签署日期' })
  contractSignDate!: string | null;

  @Field(() => String, { nullable: true, description: '甲方公司名称' })
  partyACompanyName!: string | null;

  @Field(() => String, { nullable: true, description: '甲方联系人' })
  partyAContactPerson!: string | null;

  @Field(() => String, { nullable: true, description: '甲方联系电话' })
  partyAContactPhone!: string | null;

  @Field(() => String, { nullable: true, description: '乙方公司名称' })
  partyBCompanyName!: string | null;

  @Field(() => String, { nullable: true, description: '乙方联系人' })
  partyBContactPerson!: string | null;

  @Field(() => String, { nullable: true, description: '乙方联系电话' })
  partyBContactPhone!: string | null;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;

  @Field(() => Boolean, { description: '是否有效' })
  isActive!: boolean;

  @Field(() => String, { nullable: true, description: '交易开始日期' })
  tradeStartTime!: string | null;

  @Field(() => String, { nullable: true, description: '交易结束日期' })
  tradeEndTime!: string | null;

  @Field(() => Float, { nullable: true, description: '总电量' })
  totalElectricity!: number | null;

  @Field(() => String, { nullable: true, description: '报价类型名称' })
  quoteType!: string | null;

  @Field(() => Int, { nullable: true, description: '报价类型 ID' })
  quoteTypeId!: number | null;

  @Field(() => Boolean, { nullable: true, description: '是否允许绿电' })
  greenElecAllow!: boolean | null;
}
