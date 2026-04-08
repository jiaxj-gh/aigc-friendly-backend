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
  name: 'power_system_proportion_sharing_details',
  comment: 'PowerSystem 比例分成报价详情表',
})
@Index('uq_power_system_proportion_sharing_details_quotation_id', ['quotationId'], {
  unique: true,
})
export class ProportionSharingDetailsEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    comment: '比例分成详情 ID',
  })
  id!: number;

  @Column({
    name: 'quotation_id',
    type: 'int',
    comment: '报价 ID',
  })
  quotationId!: number;

  @Column({ name: 'ps_prop_sharing_ratio', type: 'double', default: 100, comment: '分成比例' })
  psPropSharingRatio!: number;

  @Column({ name: 'ps_dist_ref_price', type: 'double', nullable: true, comment: '配电参考价' })
  psDistRefPrice!: number | null;

  @Column({
    name: 'ps_long_term_trans_ratio',
    type: 'double',
    nullable: true,
    comment: '长期交易比例',
  })
  psLongTermTransRatio!: number | null;

  @Column({
    name: 'ps_party_a_prop_below_long_term',
    type: 'double',
    nullable: true,
    comment: '长期交易下浮甲方分成',
  })
  psPartyAPropBelowLongTerm!: number | null;

  @Column({
    name: 'ps_party_b_prop_below_long_term',
    type: 'double',
    nullable: true,
    comment: '长期交易下浮乙方分成',
  })
  psPartyBPropBelowLongTerm!: number | null;

  @Column({
    name: 'ps_party_a_prop_above_long_term',
    type: 'double',
    nullable: true,
    comment: '长期交易上浮甲方分成',
  })
  psPartyAPropAboveLongTerm!: number | null;

  @Column({
    name: 'ps_party_b_prop_above_long_term',
    type: 'double',
    nullable: true,
    comment: '长期交易上浮乙方分成',
  })
  psPartyBPropAboveLongTerm!: number | null;

  @Column({ name: 'ps_monthly_bid_ratio', type: 'double', nullable: true, comment: '月度竞价比例' })
  psMonthlyBidRatio!: number | null;

  @Column({
    name: 'ps_party_a_prop_below_monthly_bid',
    type: 'double',
    nullable: true,
    comment: '月度竞价下浮甲方分成',
  })
  psPartyAPropBelowMonthlyBid!: number | null;

  @Column({
    name: 'ps_party_b_prop_below_monthly_bid',
    type: 'double',
    nullable: true,
    comment: '月度竞价下浮乙方分成',
  })
  psPartyBPropBelowMonthlyBid!: number | null;

  @Column({
    name: 'ps_party_a_prop_above_monthly_bid',
    type: 'double',
    nullable: true,
    comment: '月度竞价上浮甲方分成',
  })
  psPartyAPropAboveMonthlyBid!: number | null;

  @Column({
    name: 'ps_party_b_prop_above_monthly_bid',
    type: 'double',
    nullable: true,
    comment: '月度竞价上浮乙方分成',
  })
  psPartyBPropAboveMonthlyBid!: number | null;

  @Column({ name: 'ps_agent_proc_ratio', type: 'double', nullable: true, comment: '代理交易比例' })
  psAgentProcRatio!: number | null;

  @Column({
    name: 'ps_party_a_prop_below_agent_proc',
    type: 'double',
    nullable: true,
    comment: '代理交易下浮甲方分成',
  })
  psPartyAPropBelowAgentProc!: number | null;

  @Column({
    name: 'ps_party_b_prop_below_agent_proc',
    type: 'double',
    nullable: true,
    comment: '代理交易下浮乙方分成',
  })
  psPartyBPropBelowAgentProc!: number | null;

  @Column({
    name: 'ps_party_a_prop_above_agent_proc',
    type: 'double',
    nullable: true,
    comment: '代理交易上浮甲方分成',
  })
  psPartyAPropAboveAgentProc!: number | null;

  @Column({
    name: 'ps_party_b_prop_above_agent_proc',
    type: 'double',
    nullable: true,
    comment: '代理交易上浮乙方分成',
  })
  psPartyBPropAboveAgentProc!: number | null;

  @Column({ name: 'ps_intra_month_ratio', type: 'double', nullable: true, comment: '月内挂牌比例' })
  psIntraMonthRatio!: number | null;

  @Column({
    name: 'ps_party_a_prop_below_intra_month',
    type: 'double',
    nullable: true,
    comment: '月内挂牌下浮甲方分成',
  })
  psPartyAPropBelowIntraMonth!: number | null;

  @Column({
    name: 'ps_party_b_prop_below_intra_month',
    type: 'double',
    nullable: true,
    comment: '月内挂牌下浮乙方分成',
  })
  psPartyBPropBelowIntraMonth!: number | null;

  @Column({
    name: 'ps_party_a_prop_above_intra_month',
    type: 'double',
    nullable: true,
    comment: '月内挂牌上浮甲方分成',
  })
  psPartyAPropAboveIntraMonth!: number | null;

  @Column({
    name: 'ps_party_b_prop_above_intra_month',
    type: 'double',
    nullable: true,
    comment: '月内挂牌上浮乙方分成',
  })
  psPartyBPropAboveIntraMonth!: number | null;

  @Column({
    name: 'ps_long_term_trans_limit',
    type: 'double',
    nullable: true,
    comment: '长期交易限价',
  })
  psLongTermTransLimit!: number | null;

  @Column({ name: 'ps_monthly_bid_limit', type: 'double', nullable: true, comment: '月度竞价限价' })
  psMonthlyBidLimit!: number | null;

  @Column({ name: 'ps_agent_proc_limit', type: 'double', nullable: true, comment: '代理交易限价' })
  psAgentProcLimit!: number | null;

  @Column({ name: 'ps_intra_month_limit', type: 'double', nullable: true, comment: '月内挂牌限价' })
  psIntraMonthLimit!: number | null;

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

  @OneToOne(() => QuotationEntity, (quotation) => quotation.proportionSharingDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotation_id', referencedColumnName: 'id' })
  quotation?: QuotationEntity;
}
