import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PowerTaskComputeJobType } from './power-task-compute-job.type';

@ObjectType()
export class PowerTaskComputeSummaryType {
  @Field(() => Date, { nullable: true, description: '计算阶段开始时间' })
  startTime!: Date | null;

  @Field(() => Date, { nullable: true, description: '计算阶段结束时间' })
  endTime!: Date | null;

  @Field(() => Int, { description: '计划或已关联的计算任务总数' })
  totalJobs!: number;

  @Field(() => Int, { description: '已完成的计算任务数' })
  successfulJobs!: number;

  @Field(() => Int, { description: '已失败的计算任务数' })
  failedJobs!: number;

  @Field(() => Int, { description: '计算进度（0-100）' })
  progress!: number;

  @Field(() => [PowerTaskComputeJobType], { description: '计算任务详情' })
  jobs!: PowerTaskComputeJobType[];
}
