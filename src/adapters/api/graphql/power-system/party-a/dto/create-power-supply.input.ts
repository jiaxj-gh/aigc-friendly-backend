import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePowerSupplyInput {
  @Field(() => String, { description: '供电地址' })
  @IsString({ message: '供电地址必须是字符串' })
  @MaxLength(255, { message: '供电地址长度不能超过 255' })
  powerSupplyAddress!: string;

  @Field(() => String, { description: '供电户号' })
  @IsString({ message: '供电户号必须是字符串' })
  @MaxLength(255, { message: '供电户号长度不能超过 255' })
  powerSupplyNumber!: string;
}
