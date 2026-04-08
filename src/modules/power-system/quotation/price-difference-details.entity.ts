import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuotationEntity } from './quotation.entity';

@Entity({
  name: 'power_system_price_difference_details',
  comment: 'PowerSystem 价差浮动报价详情表',
})
@Index('uq_power_system_price_difference_details_quotation_id', ['quotationId'], { unique: true })
export class PriceDifferenceDetailsEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    comment: '价差浮动详情 ID',
  })
  id!: number;

  @Column({
    name: 'quotation_id',
    type: 'int',
    comment: '报价 ID',
  })
  quotationId!: number;

  @Column({
    name: 'pd_price_diff_fluc_ratio',
    type: 'double',
    default: 100,
    comment: '价差浮动比例',
  })
  pdPriceDiffFlucRatio!: number;

  @Column({
    name: 'pd_long_term_trans_ratio',
    type: 'double',
    nullable: true,
    comment: '长期交易比例',
  })
  pdLongTermTransRatio!: number | null;

  @Column({
    name: 'pd_long_term_trans_avg_price',
    type: 'double',
    nullable: true,
    comment: '长期交易均价',
  })
  pdLongTermTransAvgPrice!: number | null;

  @Column({
    name: 'pd_long_term_trans_direction',
    type: 'boolean',
    default: true,
    comment: '长期交易方向',
  })
  pdLongTermTransDirection!: boolean;

  @Column({ name: 'pd_monthly_bid_ratio', type: 'double', nullable: true, comment: '月度竞价比例' })
  pdMonthlyBidRatio!: number | null;

  @Column({
    name: 'pd_monthly_bid_clear_price',
    type: 'double',
    nullable: true,
    comment: '月度竞价出清价',
  })
  pdMonthlyBidClearPrice!: number | null;

  @Column({
    name: 'pd_monthly_bid_direction',
    type: 'boolean',
    default: true,
    comment: '月度竞价方向',
  })
  pdMonthlyBidDirection!: boolean;

  @Column({ name: 'pd_agent_proc_ratio', type: 'double', nullable: true, comment: '代理交易比例' })
  pdAgentProcRatio!: number | null;

  @Column({ name: 'pd_agent_avg_price', type: 'double', nullable: true, comment: '代理交易均价' })
  pdAgentAvgPrice!: number | null;

  @Column({
    name: 'pd_agent_direction',
    type: 'boolean',
    default: true,
    comment: '代理交易方向',
  })
  pdAgentDirection!: boolean;

  @Column({ name: 'pd_intra_month_ratio', type: 'double', nullable: true, comment: '月内挂牌比例' })
  pdIntraMonthRatio!: number | null;

  @Column({
    name: 'pd_intra_month_avg_price',
    type: 'double',
    nullable: true,
    comment: '月内挂牌均价',
  })
  pdIntraMonthAvgPrice!: number | null;

  @Column({
    name: 'pd_intra_month_direction',
    type: 'boolean',
    default: true,
    comment: '月内挂牌方向',
  })
  pdIntraMonthDirection!: boolean;

  @Column({
    name: 'pd_long_term_trans_limit',
    type: 'double',
    nullable: true,
    comment: '长期交易限价',
  })
  pdLongTermTransLimit!: number | null;

  @Column({ name: 'pd_monthly_bid_limit', type: 'double', nullable: true, comment: '月度竞价限价' })
  pdMonthlyBidLimit!: number | null;

  @Column({ name: 'pd_agent_proc_limit', type: 'double', nullable: true, comment: '代理交易限价' })
  pdAgentProcLimit!: number | null;

  @Column({ name: 'pd_intra_month_limit', type: 'double', nullable: true, comment: '月内挂牌限价' })
  pdIntraMonthLimit!: number | null;

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

  @OneToOne(() => QuotationEntity, (quotation) => quotation.priceDifferenceDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotation_id', referencedColumnName: 'id' })
  quotation?: QuotationEntity;
}
