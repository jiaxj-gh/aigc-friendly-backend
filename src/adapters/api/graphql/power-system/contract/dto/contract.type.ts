import { Field, ObjectType } from '@nestjs/graphql';
import { ContractBasicInfoType } from './contract-basic-info.type';
import { ContractContentType } from './contract-content.type';

@ObjectType()
export class ContractType {
  @Field(() => ContractBasicInfoType, { description: '合同基础信息' })
  basicInfo!: ContractBasicInfoType;

  @Field(() => ContractContentType, { description: '合同内容详情' })
  contractContent!: ContractContentType;
}
