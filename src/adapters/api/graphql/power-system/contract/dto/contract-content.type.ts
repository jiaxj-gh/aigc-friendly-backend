import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ContractPartyAType } from './contract-party-a.type';
import { ContractPartyBType } from './contract-party-b.type';
import { ContractQuotationInfoType } from './contract-quotation-info.type';

@ObjectType()
export class ContractContentType {
  @Field(() => String, { nullable: true, description: '工单编号' })
  workOrderNumber!: string | null;

  @Field(() => String, { description: '确认方式' })
  confirmationMethod!: string;

  @Field(() => String, { description: '甲方合同编号' })
  partyAContractNo!: string;

  @Field(() => String, { description: '乙方合同编号' })
  partyBContractNo!: string;

  @Field(() => Date, { nullable: true, description: '提交时间' })
  submissionTime!: Date | null;

  @Field(() => Date, { nullable: true, description: '确认时间' })
  confirmationTime!: Date | null;

  @Field(() => String, { nullable: true, description: '合同签署日期' })
  contractSignDate!: string | null;

  @Field(() => String, { description: '甲方签署日期' })
  partyASignDate!: string;

  @Field(() => String, { description: '乙方签署日期' })
  partyBSignDate!: string;

  @Field(() => Date, { nullable: true, description: '下单时间' })
  orderTime!: Date | null;

  @Field(() => String, { description: '签署地点' })
  signLocation!: string;

  @Field(() => String, { nullable: true, description: '附加条款' })
  additionalTerms!: string | null;

  @Field(() => String, { description: '争议解决方式' })
  disputeResolutionMethod!: string;

  @Field(() => String, { description: '备案方式' })
  filingMethod!: string;

  @Field(() => String, { description: '备案方' })
  filingParty!: string;

  @Field(() => Float, { nullable: true, description: '乙方提前 30 天终止违约金' })
  partyBTerminationBefore30!: number | null;

  @Field(() => Float, { nullable: true, description: '乙方其他情况终止违约金' })
  partyBTerminationOther!: number | null;

  @Field(() => Float, { nullable: true, description: '乙方主动终止违约金' })
  partyBTerminationActive!: number | null;

  @Field(() => Float, { nullable: true, description: '甲方提前 30 天终止违约金' })
  partyATerminationBefore30!: number | null;

  @Field(() => Float, { nullable: true, description: '甲方 30 天内终止违约金' })
  partyATerminationIn30!: number | null;

  @Field(() => Float, { nullable: true, description: '甲方主动终止违约金' })
  partyATerminationActive!: number | null;

  @Field(() => Int, { description: '正本份数' })
  originalCopies!: number;

  @Field(() => Int, { description: '副本份数' })
  duplicateCopies!: number;

  @Field(() => Int, { description: '甲方 ID' })
  partyAId!: number;

  @Field(() => Boolean, { description: '是否使用自定义甲方信息' })
  partyACustom!: boolean;

  @Field(() => String, { nullable: true, description: '自定义甲方公司名称' })
  partyACustomCompany!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方信用代码' })
  partyACustomCreditCode!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方法人' })
  partyACustomLegalPerson!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方地址' })
  partyACustomAddress!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方银行' })
  partyACustomBank!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方银行账号' })
  partyACustomBankAccount!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方联系人' })
  partyACustomContactPerson!: string | null;

  @Field(() => String, { nullable: true, description: '自定义甲方联系电话' })
  partyACustomContactPhone!: string | null;

  @Field(() => Int, { description: '乙方 ID' })
  partyBId!: number;

  @Field(() => ContractPartyAType, { nullable: true, description: '甲方信息' })
  partyA!: ContractPartyAType | null;

  @Field(() => ContractPartyBType, { nullable: true, description: '乙方信息' })
  partyB!: ContractPartyBType | null;

  @Field(() => ContractQuotationInfoType, { description: '报价信息' })
  quotationInfo!: ContractQuotationInfoType;
}
