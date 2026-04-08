import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class PartyBsInput {
  @Field(() => String, { nullable: true, description: '按配置名称模糊过滤' })
  @IsOptional()
  @IsString({ message: '配置名称必须是字符串' })
  @MaxLength(100, { message: '配置名称长度不能超过 100' })
  configName?: string;

  @Field(() => String, { nullable: true, description: '按公司名称模糊过滤' })
  @IsOptional()
  @IsString({ message: '公司名称必须是字符串' })
  @MaxLength(255, { message: '公司名称长度不能超过 255' })
  companyName?: string;

  @Field(() => Boolean, { nullable: true, description: '仅筛选默认主体' })
  @IsOptional()
  @IsBoolean({ message: '默认主体筛选值必须是布尔值' })
  isDefault?: boolean;
}
