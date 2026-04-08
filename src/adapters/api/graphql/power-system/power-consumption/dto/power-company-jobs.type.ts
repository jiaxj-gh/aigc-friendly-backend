import { Field, ObjectType } from '@nestjs/graphql';
import { PowerCompanyJobType } from './power-company-job.type';

@ObjectType()
export class PowerCompanyJobsType {
  @Field(() => String, { description: '公司名称' })
  companyName!: string;

  @Field(() => [PowerCompanyJobType], { description: '当前计算任务列表' })
  jobs!: PowerCompanyJobType[];

  @Field(() => Boolean, { description: '是否仍有任务等待计算' })
  inProgress!: boolean;
}
