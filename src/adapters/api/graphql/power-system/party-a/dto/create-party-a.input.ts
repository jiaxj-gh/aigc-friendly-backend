import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreatePowerSupplyInput } from './create-power-supply.input';

@InputType()
export class CreatePartyAInput {
  @Field(() => String, { description: '公司名称' })
  @IsString({ message: '公司名称必须是字符串' })
  @MaxLength(255, { message: '公司名称长度不能超过 255' })
  companyName!: string;

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

  @Field(() => String, { nullable: true, description: '联系邮箱' })
  @IsOptional()
  @IsString({ message: '联系邮箱必须是字符串' })
  @MaxLength(100, { message: '联系邮箱长度不能超过 100' })
  contactEmail?: string;

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

  @Field(() => [CreatePowerSupplyInput], {
    nullable: true,
    description: '供电信息列表',
  })
  @IsOptional()
  @IsArray({ message: '供电信息必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => CreatePowerSupplyInput)
  powerSupplyInfo?: CreatePowerSupplyInput[];
}
