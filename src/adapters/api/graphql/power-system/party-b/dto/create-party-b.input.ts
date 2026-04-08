import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePartyBInput {
  @Field(() => String, { description: '配置名称' })
  @IsString({ message: '配置名称必须是字符串' })
  @IsNotEmpty({ message: '配置名称不能为空' })
  @MaxLength(100, { message: '配置名称长度不能超过 100' })
  configName!: string;

  @Field(() => String, { description: '公司名称' })
  @IsString({ message: '公司名称必须是字符串' })
  @IsNotEmpty({ message: '公司名称不能为空' })
  @MaxLength(255, { message: '公司名称长度不能超过 255' })
  companyName!: string;

  @Field(() => String, { description: '统一社会信用代码' })
  @IsString({ message: '统一社会信用代码必须是字符串' })
  @IsNotEmpty({ message: '统一社会信用代码不能为空' })
  @MaxLength(50, { message: '统一社会信用代码长度不能超过 50' })
  creditCode!: string;

  @Field(() => String, { description: '公司地址' })
  @IsString({ message: '公司地址必须是字符串' })
  @IsNotEmpty({ message: '公司地址不能为空' })
  @MaxLength(255, { message: '公司地址长度不能超过 255' })
  companyAddress!: string;

  @Field(() => String, { description: '法人代表' })
  @IsString({ message: '法人代表必须是字符串' })
  @IsNotEmpty({ message: '法人代表不能为空' })
  @MaxLength(100, { message: '法人代表长度不能超过 100' })
  legalPerson!: string;

  @Field(() => String, { description: '联系人' })
  @IsString({ message: '联系人必须是字符串' })
  @IsNotEmpty({ message: '联系人不能为空' })
  @MaxLength(100, { message: '联系人长度不能超过 100' })
  contactPerson!: string;

  @Field(() => String, { description: '联系电话' })
  @IsString({ message: '联系电话必须是字符串' })
  @IsNotEmpty({ message: '联系电话不能为空' })
  @MaxLength(30, { message: '联系电话长度不能超过 30' })
  contactPhone!: string;

  @Field(() => String, { description: '联系邮箱' })
  @IsString({ message: '联系邮箱必须是字符串' })
  @IsNotEmpty({ message: '联系邮箱不能为空' })
  @MaxLength(100, { message: '联系邮箱长度不能超过 100' })
  contactEmail!: string;

  @Field(() => String, { description: '开户银行' })
  @IsString({ message: '开户银行必须是字符串' })
  @IsNotEmpty({ message: '开户银行不能为空' })
  @MaxLength(100, { message: '开户银行长度不能超过 100' })
  depositoryBank!: string;

  @Field(() => String, { description: '银行账号' })
  @IsString({ message: '银行账号必须是字符串' })
  @IsNotEmpty({ message: '银行账号不能为空' })
  @MaxLength(100, { message: '银行账号长度不能超过 100' })
  bankAccountNo!: string;

  @Field(() => String, { description: '服务热线' })
  @IsString({ message: '服务热线必须是字符串' })
  @IsNotEmpty({ message: '服务热线不能为空' })
  @MaxLength(50, { message: '服务热线长度不能超过 50' })
  hotLine!: string;

  @Field(() => Boolean, { nullable: true, description: '是否默认主体' })
  @IsOptional()
  @IsBoolean({ message: '是否默认主体必须是布尔值' })
  isDefault?: boolean;
}
