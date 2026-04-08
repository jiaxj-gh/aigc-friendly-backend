import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ContractListItemType } from './contract-list-item.type';

@ObjectType()
export class ContractsPaginationType {
  @Field(() => Int, { description: '当前页码' })
  page!: number;

  @Field(() => Int, { description: '每页数量' })
  pageSize!: number;

  @Field(() => Int, { description: '总记录数' })
  total!: number;

  @Field(() => Int, { description: '总页数' })
  totalPages!: number;

  @Field(() => Boolean, { description: '是否有下一页' })
  hasNext!: boolean;

  @Field(() => Boolean, { description: '是否有上一页' })
  hasPrev!: boolean;
}

@ObjectType()
export class ContractsOutput {
  @Field(() => [ContractListItemType], { description: '合同列表' })
  items!: ContractListItemType[];

  @Field(() => ContractsPaginationType, { description: '分页信息' })
  pagination!: ContractsPaginationType;
}
