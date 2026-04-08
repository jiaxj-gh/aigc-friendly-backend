import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class PartyAsInput {
  @Field(() => String, { nullable: true, description: '按公司名称模糊过滤' })
  @IsOptional()
  @IsString({ message: '公司名称必须是字符串' })
  @MaxLength(255, { message: '公司名称长度不能超过 255' })
  companyName?: string;

  @Field(() => String, { nullable: true, description: '按统一社会信用代码精确过滤' })
  @IsOptional()
  @IsString({ message: '统一社会信用代码必须是字符串' })
  @MaxLength(50, { message: '统一社会信用代码长度不能超过 50' })
  creditCode?: string;
}
