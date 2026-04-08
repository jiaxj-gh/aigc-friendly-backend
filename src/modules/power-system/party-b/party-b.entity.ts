import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'power_system_party_b', comment: 'PowerSystem 乙方主体配置表' })
@Index('idx_power_system_party_b_is_active_updated_at', ['isActive', 'updatedAt'])
@Index('idx_power_system_party_b_is_default', ['isDefault'])
export class PartyBEntity {
  @PrimaryGeneratedColumn({
    name: 'party_b_id',
    type: 'int',
    comment: '乙方主体 ID',
  })
  partyBId!: number;

  @Column({
    name: 'config_name',
    type: 'varchar',
    length: 100,
    comment: '配置名称',
  })
  configName!: string;

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
    comment: '统一社会信用代码',
  })
  creditCode!: string;

  @Column({
    name: 'company_address',
    type: 'varchar',
    length: 255,
    comment: '公司地址',
  })
  companyAddress!: string;

  @Column({
    name: 'legal_person',
    type: 'varchar',
    length: 100,
    comment: '法人代表',
  })
  legalPerson!: string;

  @Column({
    name: 'contact_person',
    type: 'varchar',
    length: 100,
    comment: '联系人',
  })
  contactPerson!: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 30,
    comment: '联系电话',
  })
  contactPhone!: string;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 100,
    comment: '联系邮箱',
  })
  contactEmail!: string;

  @Column({
    name: 'depository_bank',
    type: 'varchar',
    length: 100,
    comment: '开户银行',
  })
  depositoryBank!: string;

  @Column({
    name: 'bank_account_no',
    type: 'varchar',
    length: 100,
    comment: '银行账号',
  })
  bankAccountNo!: string;

  @Column({
    name: 'hot_line',
    type: 'varchar',
    length: 50,
    comment: '服务热线',
  })
  hotLine!: string;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
    comment: '是否默认主体',
  })
  isDefault!: boolean;

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
}
