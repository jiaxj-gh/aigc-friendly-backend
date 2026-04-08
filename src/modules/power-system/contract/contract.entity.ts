import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'power_system_contract', comment: 'PowerSystem 合同表' })
@Index('idx_power_system_contract_is_active_updated_at', ['isActive', 'updatedAt'])
@Index('idx_power_system_contract_party_a_id', ['partyAId'])
@Index('idx_power_system_contract_party_b_id', ['partyBId'])
export class ContractEntity {
  @PrimaryGeneratedColumn({
    name: 'contract_id',
    type: 'int',
    comment: '合同 ID',
  })
  contractId!: number;

  @Column({
    name: 'contract_current_status',
    type: 'varchar',
    length: 50,
    comment: '合同当前状态',
  })
  contractCurrentStatus!: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '是否有效',
  })
  isActive!: boolean;

  @Column({
    name: 'work_order_number',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '工单编号',
  })
  workOrderNumber!: string | null;

  @Column({
    name: 'confirmation_method',
    type: 'varchar',
    length: 50,
    default: '电子确认',
    comment: '确认方式',
  })
  confirmationMethod!: string;

  @Column({
    name: 'party_a_contract_no',
    type: 'varchar',
    length: 100,
    comment: '甲方合同编号',
  })
  partyAContractNo!: string;

  @Column({
    name: 'party_b_contract_no',
    type: 'varchar',
    length: 100,
    comment: '乙方合同编号',
  })
  partyBContractNo!: string;

  @Column({
    name: 'submission_time',
    type: 'datetime',
    nullable: true,
    comment: '提交时间',
  })
  submissionTime!: Date | null;

  @Column({
    name: 'confirmation_time',
    type: 'datetime',
    nullable: true,
    comment: '确认时间',
  })
  confirmationTime!: Date | null;

  @Column({
    name: 'contract_sign_date',
    type: 'date',
    nullable: true,
    comment: '合同签署日期',
  })
  contractSignDate!: string | null;

  @Column({
    name: 'party_a_sign_date',
    type: 'date',
    comment: '甲方签署日期',
  })
  partyASignDate!: string;

  @Column({
    name: 'party_b_sign_date',
    type: 'date',
    comment: '乙方签署日期',
  })
  partyBSignDate!: string;

  @Column({
    name: 'order_time',
    type: 'datetime',
    nullable: true,
    comment: '下单时间',
  })
  orderTime!: Date | null;

  @Column({
    name: 'sign_location',
    type: 'varchar',
    length: 255,
    comment: '签署地点',
  })
  signLocation!: string;

  @Column({
    name: 'additional_terms',
    type: 'text',
    nullable: true,
    comment: '附加条款',
  })
  additionalTerms!: string | null;

  @Column({
    name: 'dispute_resolution_method',
    type: 'varchar',
    length: 20,
    default: '2',
    comment: '争议解决方式',
  })
  disputeResolutionMethod!: string;

  @Column({
    name: 'filing_method',
    type: 'varchar',
    length: 20,
    default: '2',
    comment: '备案方式',
  })
  filingMethod!: string;

  @Column({
    name: 'filing_party',
    type: 'varchar',
    length: 20,
    default: '乙',
    comment: '备案方',
  })
  filingParty!: string;

  @Column({
    name: 'party_b_termination_before30',
    type: 'double',
    nullable: true,
    comment: '乙方提前 30 天终止违约金',
  })
  partyBTerminationBefore30!: number | null;

  @Column({
    name: 'party_b_termination_other',
    type: 'double',
    nullable: true,
    comment: '乙方其他情况终止违约金',
  })
  partyBTerminationOther!: number | null;

  @Column({
    name: 'party_b_termination_active',
    type: 'double',
    nullable: true,
    comment: '乙方主动终止违约金',
  })
  partyBTerminationActive!: number | null;

  @Column({
    name: 'party_a_termination_before30',
    type: 'double',
    nullable: true,
    comment: '甲方提前 30 天终止违约金',
  })
  partyATerminationBefore30!: number | null;

  @Column({
    name: 'party_a_termination_in30',
    type: 'double',
    nullable: true,
    comment: '甲方 30 天内终止违约金',
  })
  partyATerminationIn30!: number | null;

  @Column({
    name: 'party_a_termination_active',
    type: 'double',
    nullable: true,
    comment: '甲方主动终止违约金',
  })
  partyATerminationActive!: number | null;

  @Column({
    name: 'original_copies',
    type: 'int',
    default: 2,
    comment: '正本份数',
  })
  originalCopies!: number;

  @Column({
    name: 'duplicate_copies',
    type: 'int',
    default: 1,
    comment: '副本份数',
  })
  duplicateCopies!: number;

  @Column({
    name: 'party_a_custom',
    type: 'boolean',
    default: false,
    comment: '是否使用自定义甲方信息',
  })
  partyACustom!: boolean;

  @Column({
    name: 'party_a_custom_company',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '自定义甲方公司名称',
  })
  partyACustomCompany!: string | null;

  @Column({
    name: 'party_a_custom_credit_code',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '自定义甲方信用代码',
  })
  partyACustomCreditCode!: string | null;

  @Column({
    name: 'party_a_custom_legal_person',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '自定义甲方法人',
  })
  partyACustomLegalPerson!: string | null;

  @Column({
    name: 'party_a_custom_address',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '自定义甲方地址',
  })
  partyACustomAddress!: string | null;

  @Column({
    name: 'party_a_custom_bank',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '自定义甲方银行',
  })
  partyACustomBank!: string | null;

  @Column({
    name: 'party_a_custom_bank_account',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '自定义甲方银行账号',
  })
  partyACustomBankAccount!: string | null;

  @Column({
    name: 'party_a_custom_contact_person',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '自定义甲方联系人',
  })
  partyACustomContactPerson!: string | null;

  @Column({
    name: 'party_a_custom_contact_phone',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '自定义甲方联系电话',
  })
  partyACustomContactPhone!: string | null;

  @Column({
    name: 'party_a_id',
    type: 'int',
    comment: '甲方主体 ID',
  })
  partyAId!: number;

  @Column({
    name: 'party_b_id',
    type: 'int',
    comment: '乙方主体 ID',
  })
  partyBId!: number;

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
