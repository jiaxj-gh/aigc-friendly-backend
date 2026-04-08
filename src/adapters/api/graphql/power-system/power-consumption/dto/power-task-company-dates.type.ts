import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerTaskCompanyDatesType {
  @Field(() => String, { description: '公司名称' })
  companyName!: string;

  @Field(() => [String], { description: '新增数据日期列表' })
  dates!: string[];
}
