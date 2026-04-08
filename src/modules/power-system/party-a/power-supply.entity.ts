import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartyAEntity } from './party-a.entity';

@Entity({ name: 'power_system_power_supply', comment: 'PowerSystem 供电信息表' })
@Index('idx_power_system_power_supply_party_a_id', ['partyAId'])
export class PowerSupplyEntity {
  @PrimaryGeneratedColumn({
    name: 'ps_id',
    type: 'int',
    comment: '供电信息 ID',
  })
  psId!: number;

  @Column({
    name: 'party_a_id',
    type: 'int',
    comment: '甲方主体 ID',
  })
  partyAId!: number;

  @Column({
    name: 'power_supply_address',
    type: 'varchar',
    length: 255,
    comment: '供电地址',
  })
  powerSupplyAddress!: string;

  @Column({
    name: 'power_supply_number',
    type: 'varchar',
    length: 255,
    comment: '供电户号',
  })
  powerSupplyNumber!: string;

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

  @ManyToOne(() => PartyAEntity, (partyA) => partyA.powerSupplyInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'party_a_id', referencedColumnName: 'partyAId' })
  partyA!: PartyAEntity;
}
