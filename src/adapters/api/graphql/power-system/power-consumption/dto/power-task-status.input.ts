import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType()
export class PowerTaskStatusInput {
  @Field(() => Int, { description: '任务 ID' })
  @IsInt({ message: '任务 ID 必须是整数' })
  @Min(1, { message: '任务 ID 必须大于 0' })
  taskId!: number;
}
