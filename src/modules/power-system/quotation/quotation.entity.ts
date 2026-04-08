import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FixedPriceDetailsEntity } from './fixed-price-details.entity';
import { PriceDifferenceDetailsEntity } from './price-difference-details.entity';
import { ProportionSharingDetailsEntity } from './proportion-sharing-details.entity';

@Entity({ name: 'power_system_quotation', comment: 'PowerSystem 报价主表' })
@Index('uq_power_system_quotation_contract_id_quote_type_id', ['contractId', 'quoteTypeId'], {
  unique: true,
})
@Index('idx_power_system_quotation_contract_id_quote_type_id', ['contractId', 'quoteTypeId'])
export class QuotationEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    comment: '报价 ID',
  })
  id!: number;

  @Column({
    name: 'contract_id',
    type: 'int',
    comment: '合同 ID',
  })
  contractId!: number;

  @Column({
    name: 'quote_type_id',
    type: 'int',
    comment: '报价类型 ID（1 固定价格，2 比例分成，3 价差浮动）',
  })
  quoteTypeId!: number;

  @Column({
    name: 'green_elec_allow',
    type: 'boolean',
    default: true,
    comment: '是否允许绿电',
  })
  greenElecAllow!: boolean;

  @Column({
    name: 'green_elec_price',
    type: 'double',
    nullable: true,
    comment: '绿电价格',
  })
  greenElecPrice!: number | null;

  @Column({
    name: 'trade_start_time',
    type: 'date',
    comment: '交易开始日期',
  })
  tradeStartTime!: string;

  @Column({
    name: 'trade_end_time',
    type: 'date',
    comment: '交易结束日期',
  })
  tradeEndTime!: string;

  @Column({
    name: 'total_electricity',
    type: 'double',
    comment: '总电量',
  })
  totalElectricity!: number;

  @Column({
    name: 'monthly_electricity',
    type: 'json',
    comment: '月度电量 JSON',
  })
  monthlyElectricity!: Record<string, number>;

  @Column({
    name: 'electricity_deviation',
    type: 'double',
    nullable: true,
    comment: '电量偏差',
  })
  electricityDeviation!: number | null;

  @Column({
    name: 'positive_deviation_ratio',
    type: 'double',
    nullable: true,
    comment: '正偏差比例',
  })
  positiveDeviationRatio!: number | null;

  @Column({
    name: 'positive_deviation_price',
    type: 'double',
    nullable: true,
    comment: '正偏差价格',
  })
  positiveDeviationPrice!: number | null;

  @Column({
    name: 'negative_deviation_ratio',
    type: 'double',
    nullable: true,
    comment: '负偏差比例',
  })
  negativeDeviationRatio!: number | null;

  @Column({
    name: 'negative_deviation_price',
    type: 'double',
    nullable: true,
    comment: '负偏差价格',
  })
  negativeDeviationPrice!: number | null;

  @Column({
    name: 'standard_curve_method',
    type: 'boolean',
    default: false,
    comment: '是否标准曲线方式',
  })
  standardCurveMethod!: boolean;

  @Column({
    name: 'curve_modify_days',
    type: 'int',
    nullable: true,
    comment: '曲线修正天数',
  })
  curveModifyDays!: number | null;

  @Column({
    name: 'curve_deviation',
    type: 'double',
    nullable: true,
    comment: '曲线偏差',
  })
  curveDeviation!: number | null;

  @Column({
    name: 'curve_positive_ratio',
    type: 'double',
    nullable: true,
    comment: '曲线正偏差比例',
  })
  curvePositiveRatio!: number | null;

  @Column({
    name: 'curve_positive_price',
    type: 'double',
    nullable: true,
    comment: '曲线正偏差价格',
  })
  curvePositivePrice!: number | null;

  @Column({
    name: 'curve_negative_ratio',
    type: 'double',
    nullable: true,
    comment: '曲线负偏差比例',
  })
  curveNegativeRatio!: number | null;

  @Column({
    name: 'curve_negative_price',
    type: 'double',
    nullable: true,
    comment: '曲线负偏差价格',
  })
  curveNegativePrice!: number | null;

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

  @OneToOne(() => FixedPriceDetailsEntity, (details) => details.quotation)
  fixedPriceDetails?: FixedPriceDetailsEntity | null;

  @OneToOne(() => ProportionSharingDetailsEntity, (details) => details.quotation)
  proportionSharingDetails?: ProportionSharingDetailsEntity | null;

  @OneToOne(() => PriceDifferenceDetailsEntity, (details) => details.quotation)
  priceDifferenceDetails?: PriceDifferenceDetailsEntity | null;
}
