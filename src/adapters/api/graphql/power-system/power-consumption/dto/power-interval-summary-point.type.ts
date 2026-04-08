import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PowerIntervalSummaryPointType {
  @Field(() => Date, { description: '时间点' })
  timestamp!: Date;

  @Field(() => Float, { nullable: true, description: '实际电量 (kWh)' })
  actualEnergyKwh!: number | null;

  @Field(() => Float, { nullable: true, description: '预测电量 (kWh)' })
  forecastEnergyKwh!: number | null;
}
