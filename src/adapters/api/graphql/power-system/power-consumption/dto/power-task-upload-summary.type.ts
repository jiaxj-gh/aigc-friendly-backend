import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PowerTaskCompanyDatesType } from './power-task-company-dates.type';
import { PowerTaskUploadFileType } from './power-task-upload-file.type';

@ObjectType()
export class PowerTaskUploadSummaryType {
  @Field(() => Date, { nullable: true, description: '上传阶段开始时间' })
  startTime!: Date | null;

  @Field(() => Date, { nullable: true, description: '上传阶段结束时间' })
  endTime!: Date | null;

  @Field(() => Int, { description: '计划或已关联的文件总数' })
  totalFiles!: number;

  @Field(() => Int, { description: '上传成功的文件数' })
  uploadedFiles!: number;

  @Field(() => Int, { description: '上传失败的文件数' })
  failedFiles!: number;

  @Field(() => [PowerTaskUploadFileType], { description: '上传文件详情' })
  files!: PowerTaskUploadFileType[];

  @Field(() => [PowerTaskCompanyDatesType], { description: '按公司汇总的新增数据日期' })
  companyDates!: PowerTaskCompanyDatesType[];
}
