import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerTaskComputeJobType {
  @Field(() => String, { description: '公司名称' })
  companyName!: string;

  @Field(() => String, { description: '预测日期' })
  predictedDate!: string;

  @Field(() => String, { description: '计算状态' })
  status!: string;

  @Field(() => String, { nullable: true, description: '计算失败信息' })
  errorMessage!: string | null;
}
