import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PartyBType {
  @Field(() => Int, { description: '乙方主体 ID' })
  partyBId!: number;

  @Field(() => String, { description: '配置名称' })
  configName!: string;

  @Field(() => String, { description: '公司名称' })
  companyName!: string;

  @Field(() => String, { description: '统一社会信用代码' })
  creditCode!: string;

  @Field(() => String, { description: '公司地址' })
  companyAddress!: string;

  @Field(() => String, { description: '法人代表' })
  legalPerson!: string;

  @Field(() => String, { description: '联系人' })
  contactPerson!: string;

  @Field(() => String, { description: '联系电话' })
  contactPhone!: string;

  @Field(() => String, { description: '联系邮箱' })
  contactEmail!: string;

  @Field(() => String, { description: '开户银行' })
  depositoryBank!: string;

  @Field(() => String, { description: '银行账号' })
  bankAccountNo!: string;

  @Field(() => String, { description: '服务热线' })
  hotLine!: string;

  @Field(() => Boolean, { description: '是否默认主体' })
  isDefault!: boolean;

  @Field(() => Boolean, { description: '是否有效' })
  isActive!: boolean;

  @Field(() => Date, { description: '创建时间' })
  createdAt!: Date;

  @Field(() => Date, { description: '更新时间' })
  updatedAt!: Date;

  @Field(() => String, { nullable: true, description: '创建人标识' })
  createdBy!: string | null;

  @Field(() => String, { nullable: true, description: '更新人标识' })
  updatedBy!: string | null;
}
