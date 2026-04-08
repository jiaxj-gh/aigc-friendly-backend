import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateContractQuotationInput } from './create-contract-quotation.input';

@InputType()
export class CreateContractInput {
  @Field(() => String, { description: '甲方合同编号' })
  @IsString({ message: '甲方合同编号必须是字符串' })
  @MaxLength(100, { message: '甲方合同编号长度不能超过 100' })
  partyAContractNo!: string;

  @Field(() => String, { description: '乙方合同编号' })
  @IsString({ message: '乙方合同编号必须是字符串' })
  @MaxLength(100, { message: '乙方合同编号长度不能超过 100' })
  partyBContractNo!: string;

  @Field(() => String, { description: '甲方签署日期' })
  @IsString({ message: '甲方签署日期必须是字符串' })
  partyASignDate!: string;

  @Field(() => String, { description: '乙方签署日期' })
  @IsString({ message: '乙方签署日期必须是字符串' })
  partyBSignDate!: string;

  @Field(() => String, { description: '签署地点' })
  @IsString({ message: '签署地点必须是字符串' })
  @MaxLength(255, { message: '签署地点长度不能超过 255' })
  signLocation!: string;

  @Field(() => Int, { description: '乙方 ID' })
  @IsNumber({}, { message: '乙方 ID 必须是数字' })
  partyBId!: number;

  @Field(() => String, { nullable: true, description: '合同当前状态' })
  @IsOptional()
  @IsString({ message: '合同当前状态必须是字符串' })
  @MaxLength(50, { message: '合同当前状态长度不能超过 50' })
  contractCurrentStatus?: string;

  @Field(() => String, { nullable: true, description: '工单编号' })
  @IsOptional()
  @IsString({ message: '工单编号必须是字符串' })
  @MaxLength(100, { message: '工单编号长度不能超过 100' })
  workOrderNumber?: string;

  @Field(() => String, { nullable: true, description: '确认方式' })
  @IsOptional()
  @IsString({ message: '确认方式必须是字符串' })
  @MaxLength(50, { message: '确认方式长度不能超过 50' })
  confirmationMethod?: string;

  @Field(() => String, { nullable: true, description: '提交时间' })
  @IsOptional()
  @IsString({ message: '提交时间必须是字符串' })
  submissionTime?: string;

  @Field(() => String, { nullable: true, description: '确认时间' })
  @IsOptional()
  @IsString({ message: '确认时间必须是字符串' })
  confirmationTime?: string;

  @Field(() => String, { nullable: true, description: '合同签署日期' })
  @IsOptional()
  @IsString({ message: '合同签署日期必须是字符串' })
  contractSignDate?: string;

  @Field(() => String, { nullable: true, description: '下单时间' })
  @IsOptional()
  @IsString({ message: '下单时间必须是字符串' })
  orderTime?: string;

  @Field(() => String, { nullable: true, description: '附加条款' })
  @IsOptional()
  @IsString({ message: '附加条款必须是字符串' })
  additionalTerms?: string;

  @Field(() => String, { nullable: true, description: '争议解决方式' })
  @IsOptional()
  @IsString({ message: '争议解决方式必须是字符串' })
  @MaxLength(20, { message: '争议解决方式长度不能超过 20' })
  disputeResolutionMethod?: string;

  @Field(() => String, { nullable: true, description: '备案方式' })
  @IsOptional()
  @IsString({ message: '备案方式必须是字符串' })
  @MaxLength(20, { message: '备案方式长度不能超过 20' })
  filingMethod?: string;

  @Field(() => String, { nullable: true, description: '备案方' })
  @IsOptional()
  @IsString({ message: '备案方必须是字符串' })
  @MaxLength(20, { message: '备案方长度不能超过 20' })
  filingParty?: string;

  @Field(() => Float, { nullable: true, description: '乙方提前 30 天终止违约金' })
  @IsOptional()
  @IsNumber({}, { message: '乙方提前 30 天终止违约金必须是数字' })
  partyBTerminationBefore30?: number;

  @Field(() => Float, { nullable: true, description: '乙方其他情况终止违约金' })
  @IsOptional()
  @IsNumber({}, { message: '乙方其他情况终止违约金必须是数字' })
  partyBTerminationOther?: number;

  @Field(() => Float, { nullable: true, description: '乙方主动终止违约金' })
  @IsOptional()
  @IsNumber({}, { message: '乙方主动终止违约金必须是数字' })
  partyBTerminationActive?: number;

  @Field(() => Float, { nullable: true, description: '甲方提前 30 天终止违约金' })
  @IsOptional()
  @IsNumber({}, { message: '甲方提前 30 天终止违约金必须是数字' })
  partyATerminationBefore30?: number;

  @Field(() => Float, { nullable: true, description: '甲方 30 天内终止违约金' })
  @IsOptional()
  @IsNumber({}, { message: '甲方 30 天内终止违约金必须是数字' })
  partyATerminationIn30?: number;

  @Field(() => Float, { nullable: true, description: '甲方主动终止违约金' })
  @IsOptional()
  @IsNumber({}, { message: '甲方主动终止违约金必须是数字' })
  partyATerminationActive?: number;

  @Field(() => Int, { nullable: true, description: '正本份数' })
  @IsOptional()
  @IsNumber({}, { message: '正本份数必须是数字' })
  originalCopies?: number;

  @Field(() => Int, { nullable: true, description: '副本份数' })
  @IsOptional()
  @IsNumber({}, { message: '副本份数必须是数字' })
  duplicateCopies?: number;

  @Field(() => Int, { nullable: true, description: '甲方 ID' })
  @IsOptional()
  @IsNumber({}, { message: '甲方 ID 必须是数字' })
  partyAId?: number;

  @Field(() => Boolean, { nullable: true, description: '是否使用自定义甲方信息' })
  @IsOptional()
  @IsBoolean({ message: '是否使用自定义甲方信息必须是布尔值' })
  partyACustom?: boolean;

  @Field(() => String, { nullable: true, description: '自定义甲方公司名称' })
  @IsOptional()
  @IsString({ message: '自定义甲方公司名称必须是字符串' })
  @MaxLength(255, { message: '自定义甲方公司名称长度不能超过 255' })
  partyACustomCompany?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方信用代码' })
  @IsOptional()
  @IsString({ message: '自定义甲方信用代码必须是字符串' })
  @MaxLength(100, { message: '自定义甲方信用代码长度不能超过 100' })
  partyACustomCreditCode?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方法人' })
  @IsOptional()
  @IsString({ message: '自定义甲方法人必须是字符串' })
  @MaxLength(100, { message: '自定义甲方法人长度不能超过 100' })
  partyACustomLegalPerson?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方地址' })
  @IsOptional()
  @IsString({ message: '自定义甲方地址必须是字符串' })
  @MaxLength(255, { message: '自定义甲方地址长度不能超过 255' })
  partyACustomAddress?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方开户银行' })
  @IsOptional()
  @IsString({ message: '自定义甲方开户银行必须是字符串' })
  @MaxLength(100, { message: '自定义甲方开户银行长度不能超过 100' })
  partyACustomBank?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方银行账号' })
  @IsOptional()
  @IsString({ message: '自定义甲方银行账号必须是字符串' })
  @MaxLength(100, { message: '自定义甲方银行账号长度不能超过 100' })
  partyACustomBankAccount?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方联系人' })
  @IsOptional()
  @IsString({ message: '自定义甲方联系人必须是字符串' })
  @MaxLength(100, { message: '自定义甲方联系人长度不能超过 100' })
  partyACustomContactPerson?: string;

  @Field(() => String, { nullable: true, description: '自定义甲方联系电话' })
  @IsOptional()
  @IsString({ message: '自定义甲方联系电话必须是字符串' })
  @MaxLength(30, { message: '自定义甲方联系电话长度不能超过 30' })
  partyACustomContactPhone?: string;

  @Field(() => CreateContractQuotationInput, { description: '报价信息' })
  @ValidateNested()
  @Type(() => CreateContractQuotationInput)
  quotation!: CreateContractQuotationInput;
}
