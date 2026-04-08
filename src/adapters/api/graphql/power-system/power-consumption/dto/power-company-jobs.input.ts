import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength } from 'class-validator';

@InputType()
export class PowerCompanyJobsInput {
  @Field(() => String, { description: '公司名称' })
  @IsString({ message: '公司名称必须是字符串' })
  @MaxLength(255, { message: '公司名称长度不能超过 255' })
  companyName!: string;
}
