import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PowerTaskComputeSummaryType } from './power-task-compute-summary.type';
import { PowerTaskUploadSummaryType } from './power-task-upload-summary.type';

@ObjectType()
export class PowerTaskStatusType {
  @Field(() => Int, { description: '任务 ID' })
  taskId!: number;

  @Field(() => String, { nullable: true, description: '任务名称' })
  taskName!: string | null;

  @Field(() => String, { description: '任务状态' })
  status!: string;

  @Field(() => Date, { nullable: true, description: '任务开始时间' })
  startTime!: Date | null;

  @Field(() => Date, { nullable: true, description: '任务结束时间' })
  endTime!: Date | null;

  @Field(() => PowerTaskUploadSummaryType, { description: '上传阶段详情' })
  upload!: PowerTaskUploadSummaryType;

  @Field(() => PowerTaskComputeSummaryType, { description: '计算阶段详情' })
  compute!: PowerTaskComputeSummaryType;

  @Field(() => String, { nullable: true, description: '任务异常信息' })
  errorMessage!: string | null;
}
