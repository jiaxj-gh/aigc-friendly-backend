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
  name: 'power_system_fixed_price_details',
  comment: 'PowerSystem 固定价格报价详情表',
})
@Index('uq_power_system_fixed_price_details_quotation_id', ['quotationId'], { unique: true })
export class FixedPriceDetailsEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    comment: '固定价格详情 ID',
  })
  id!: number;

  @Column({
    name: 'quotation_id',
    type: 'int',
    comment: '报价 ID',
  })
  quotationId!: number;

  @Column({
    name: 'fixed_price_ratio',
    type: 'double',
    default: 100,
    comment: '固定价格比例',
  })
  fixedPriceRatio!: number;

  @Column({
    name: 'market_transaction_price',
    type: 'double',
    nullable: true,
    comment: '市场化交易价格',
  })
  marketTransactionPrice!: number | null;

  @Column({
    name: 'price_limit',
    type: 'double',
    nullable: true,
    comment: '价格上限',
  })
  priceLimit!: number | null;

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

  @OneToOne(() => QuotationEntity, (quotation) => quotation.fixedPriceDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotation_id', referencedColumnName: 'id' })
  quotation?: QuotationEntity;
}
