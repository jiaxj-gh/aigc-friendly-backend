import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerCompanyJobType {
  @Field(() => Int, { description: '所属任务 ID' })
  taskId!: number;

  @Field(() => String, { nullable: true, description: '任务名称' })
  taskName!: string | null;

  @Field(() => String, { description: '预测对应日期' })
  predictedDate!: string;

  @Field(() => String, { description: '任务状态' })
  status!: string;

  @Field(() => String, { nullable: true, description: '失败信息' })
  errorMessage!: string | null;
}
