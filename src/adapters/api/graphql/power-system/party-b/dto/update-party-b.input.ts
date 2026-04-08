import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class UpdatePartyBInput {
  @Field(() => Int, { description: '乙方主体 ID' })
  @IsInt({ message: '乙方主体 ID 必须是整数' })
  @Min(1, { message: '乙方主体 ID 必须大于 0' })
  partyBId!: number;

  @Field(() => String, { nullable: true, description: '配置名称' })
  @IsOptional()
  @IsString({ message: '配置名称必须是字符串' })
  @MaxLength(100, { message: '配置名称长度不能超过 100' })
  configName?: string;

  @Field(() => String, { nullable: true, description: '公司名称' })
  @IsOptional()
  @IsString({ message: '公司名称必须是字符串' })
  @MaxLength(255, { message: '公司名称长度不能超过 255' })
  companyName?: string;

  @Field(() => String, { nullable: true, description: '统一社会信用代码' })
  @IsOptional()
  @IsString({ message: '统一社会信用代码必须是字符串' })
  @MaxLength(50, { message: '统一社会信用代码长度不能超过 50' })
  creditCode?: string;

  @Field(() => String, { nullable: true, description: '公司地址' })
  @IsOptional()
  @IsString({ message: '公司地址必须是字符串' })
  @MaxLength(255, { message: '公司地址长度不能超过 255' })
  companyAddress?: string;

  @Field(() => String, { nullable: true, description: '法人代表' })
  @IsOptional()
  @IsString({ message: '法人代表必须是字符串' })
  @MaxLength(100, { message: '法人代表长度不能超过 100' })
  legalPerson?: string;

  @Field(() => String, { nullable: true, description: '联系人' })
  @IsOptional()
  @IsString({ message: '联系人必须是字符串' })
  @MaxLength(100, { message: '联系人长度不能超过 100' })
  contactPerson?: string;

  @Field(() => String, { nullable: true, description: '联系电话' })
  @IsOptional()
  @IsString({ message: '联系电话必须是字符串' })
  @MaxLength(30, { message: '联系电话长度不能超过 30' })
  contactPhone?: string;

  @Field(() => String, { nullable: true, description: '联系邮箱' })
  @IsOptional()
  @IsString({ message: '联系邮箱必须是字符串' })
  @MaxLength(100, { message: '联系邮箱长度不能超过 100' })
  contactEmail?: string;

  @Field(() => String, { nullable: true, description: '开户银行' })
  @IsOptional()
  @IsString({ message: '开户银行必须是字符串' })
  @MaxLength(100, { message: '开户银行长度不能超过 100' })
  depositoryBank?: string;

  @Field(() => String, { nullable: true, description: '银行账号' })
  @IsOptional()
  @IsString({ message: '银行账号必须是字符串' })
  @MaxLength(100, { message: '银行账号长度不能超过 100' })
  bankAccountNo?: string;

  @Field(() => String, { nullable: true, description: '服务热线' })
  @IsOptional()
  @IsString({ message: '服务热线必须是字符串' })
  @MaxLength(50, { message: '服务热线长度不能超过 50' })
  hotLine?: string;

  @Field(() => Boolean, { nullable: true, description: '是否默认主体' })
  @IsOptional()
  @IsBoolean({ message: '是否默认主体必须是布尔值' })
  isDefault?: boolean;
}
