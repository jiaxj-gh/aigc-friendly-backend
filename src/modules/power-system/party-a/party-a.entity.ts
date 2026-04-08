import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PowerSupplyEntity } from './power-supply.entity';

@Entity({ name: 'power_system_party_a', comment: 'PowerSystem 甲方主体表' })
@Index('idx_power_system_party_a_is_active_updated_at', ['isActive', 'updatedAt'])
export class PartyAEntity {
  @PrimaryGeneratedColumn({
    name: 'party_a_id',
    type: 'int',
    comment: '甲方主体 ID',
  })
  partyAId!: number;

  @Column({
    name: 'company_name',
    type: 'varchar',
    length: 255,
    comment: '公司名称',
  })
  companyName!: string;

  @Column({
    name: 'credit_code',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '统一社会信用代码',
  })
  creditCode!: string | null;

  @Column({
    name: 'company_address',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '公司地址',
  })
  companyAddress!: string | null;

  @Column({
    name: 'legal_person',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '法人代表',
  })
  legalPerson!: string | null;

  @Column({
    name: 'depository_bank',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '开户银行',
  })
  depositoryBank!: string | null;

  @Column({
    name: 'bank_account_no',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '银行账号',
  })
  bankAccountNo!: string | null;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '联系邮箱',
  })
  contactEmail!: string | null;

  @Column({
    name: 'contact_person',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '联系人',
  })
  contactPerson!: string | null;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '联系电话',
  })
  contactPhone!: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '是否有效',
  })
  isActive!: boolean;

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

  @OneToMany(() => PowerSupplyEntity, (powerSupply) => powerSupply.partyA)
  powerSupplyInfo!: PowerSupplyEntity[];
}
