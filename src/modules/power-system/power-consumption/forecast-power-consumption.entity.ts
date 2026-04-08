import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { POWER_CONSUMPTION_INTERVALS } from './power-consumption.constants';

@Entity({
  name: 'power_system_forecast_power_consumption',
  comment: 'PowerSystem 预测用电量表',
})
@Index('idx_power_system_forecast_power_consumption_retail_user_name', ['retailUserName'])
@Index('idx_power_system_forecast_power_consumption_record_date', ['recordDate'])
@Unique('uq_power_system_forecast_power_consumption_company_date', ['retailUserName', 'recordDate'])
export class ForecastPowerConsumptionEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    comment: '主键 ID',
  })
  id!: number;

  @Column({
    name: 'seller_company_name',
    type: 'varchar',
    length: 255,
    comment: '售电公司名称',
  })
  sellerCompanyName!: string;

  @Column({
    name: 'retail_user_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '零售用户名',
  })
  retailUserName!: string | null;

  @Column({
    name: 'record_date',
    type: 'date',
    comment: '日期',
  })
  recordDate!: string;

  @Column({
    name: 'use_date',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '预测所用数据来源日期范围',
  })
  useDate!: string | null;

  @Column({
    name: 'daily_total_energy_kwh',
    type: 'double',
    nullable: true,
    comment: '日总电量 (kWh)',
  })
  dailyTotalEnergyKwh!: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    comment: '创建时间（系统事件时间）',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    comment: '更新时间（系统事件时间）',
  })
  updatedAt!: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '创建人标识',
  })
  createdBy!: string | null;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '更新人标识',
  })
  updatedBy!: string | null;
}

for (const interval of POWER_CONSUMPTION_INTERVALS) {
  Column({
    name: interval.columnName,
    type: 'double',
    nullable: true,
    comment: `${interval.timeLabel} 用电量 (kWh)`,
  })(ForecastPowerConsumptionEntity.prototype, interval.propertyName);
}
