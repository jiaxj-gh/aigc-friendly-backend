import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ContractPowerSupplyType } from './contract-power-supply.type';

@ObjectType()
export class ContractPartyAType {
  @Field(() => Int, { description: '甲方 ID' })
  partyAId!: number;

  @Field(() => String, { nullable: true, description: '公司名称' })
  companyName!: string | null;

  @Field(() => String, { nullable: true, description: '统一社会信用代码' })
  creditCode!: string | null;

  @Field(() => String, { nullable: true, description: '公司地址' })
  companyAddress!: string | null;

  @Field(() => String, { nullable: true, description: '法人代表' })
  legalPerson!: string | null;

  @Field(() => String, { nullable: true, description: '开户银行' })
  depositoryBank!: string | null;

  @Field(() => String, { nullable: true, description: '银行账号' })
  bankAccountNo!: string | null;

  @Field(() => String, { nullable: true, description: '联系邮箱' })
  contactEmail!: string | null;

  @Field(() => String, { nullable: true, description: '联系人' })
  contactPerson!: string | null;

  @Field(() => String, { nullable: true, description: '联系电话' })
  contactPhone!: string | null;

  @Field(() => [ContractPowerSupplyType], { description: '供电信息列表' })
  powerSupplyInfo!: ContractPowerSupplyType[];

  @Field(() => Boolean, { description: '是否有效' })
  isActive!: boolean;

  @Field(() => Date, { nullable: true, description: '创建时间' })
  createdAt!: Date | null;

  @Field(() => Date, { nullable: true, description: '更新时间' })
  updatedAt!: Date | null;

  @Field(() => String, { nullable: true, description: '创建人标识' })
  createdBy!: string | null;

  @Field(() => String, { nullable: true, description: '更新人标识' })
  updatedBy!: string | null;
}
