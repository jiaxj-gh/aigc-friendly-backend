import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePowerSystemContractTable1773928300000 implements MigrationInterface {
  name = 'CreatePowerSystemContractTable1773928300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`power_system_contract\` (
        \`contract_id\` int NOT NULL AUTO_INCREMENT COMMENT '合同 ID',
        \`contract_current_status\` varchar(50) NOT NULL COMMENT '合同当前状态',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
        \`work_order_number\` varchar(100) DEFAULT NULL COMMENT '工单编号',
        \`confirmation_method\` varchar(50) NOT NULL DEFAULT '电子确认' COMMENT '确认方式',
        \`party_a_contract_no\` varchar(100) NOT NULL COMMENT '甲方合同编号',
        \`party_b_contract_no\` varchar(100) NOT NULL COMMENT '乙方合同编号',
        \`submission_time\` datetime DEFAULT NULL COMMENT '提交时间',
        \`confirmation_time\` datetime DEFAULT NULL COMMENT '确认时间',
        \`contract_sign_date\` date DEFAULT NULL COMMENT '合同签署日期',
        \`party_a_sign_date\` date NOT NULL COMMENT '甲方签署日期',
        \`party_b_sign_date\` date NOT NULL COMMENT '乙方签署日期',
        \`order_time\` datetime DEFAULT NULL COMMENT '下单时间',
        \`sign_location\` varchar(255) NOT NULL COMMENT '签署地点',
        \`additional_terms\` text COMMENT '附加条款',
        \`dispute_resolution_method\` varchar(20) NOT NULL DEFAULT '2' COMMENT '争议解决方式',
        \`filing_method\` varchar(20) NOT NULL DEFAULT '2' COMMENT '备案方式',
        \`filing_party\` varchar(20) NOT NULL DEFAULT '乙' COMMENT '备案方',
        \`party_b_termination_before30\` double DEFAULT NULL COMMENT '乙方提前 30 天终止违约金',
        \`party_b_termination_other\` double DEFAULT NULL COMMENT '乙方其他情况终止违约金',
        \`party_b_termination_active\` double DEFAULT NULL COMMENT '乙方主动终止违约金',
        \`party_a_termination_before30\` double DEFAULT NULL COMMENT '甲方提前 30 天终止违约金',
        \`party_a_termination_in30\` double DEFAULT NULL COMMENT '甲方 30 天内终止违约金',
        \`party_a_termination_active\` double DEFAULT NULL COMMENT '甲方主动终止违约金',
        \`original_copies\` int NOT NULL DEFAULT 2 COMMENT '正本份数',
        \`duplicate_copies\` int NOT NULL DEFAULT 1 COMMENT '副本份数',
        \`party_a_custom\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否使用自定义甲方信息',
        \`party_a_custom_company\` varchar(255) DEFAULT NULL COMMENT '自定义甲方公司名称',
        \`party_a_custom_credit_code\` varchar(100) DEFAULT NULL COMMENT '自定义甲方信用代码',
        \`party_a_custom_legal_person\` varchar(100) DEFAULT NULL COMMENT '自定义甲方法人',
        \`party_a_custom_address\` varchar(255) DEFAULT NULL COMMENT '自定义甲方地址',
        \`party_a_custom_bank\` varchar(100) DEFAULT NULL COMMENT '自定义甲方银行',
        \`party_a_custom_bank_account\` varchar(100) DEFAULT NULL COMMENT '自定义甲方银行账号',
        \`party_a_custom_contact_person\` varchar(100) DEFAULT NULL COMMENT '自定义甲方联系人',
        \`party_a_custom_contact_phone\` varchar(30) DEFAULT NULL COMMENT '自定义甲方联系电话',
        \`party_a_id\` int NOT NULL COMMENT '甲方主体 ID',
        \`party_b_id\` int NOT NULL COMMENT '乙方主体 ID',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`contract_id\`),
        KEY \`idx_power_system_contract_is_active_updated_at\` (\`is_active\`, \`updated_at\`),
        KEY \`idx_power_system_contract_party_a_id\` (\`party_a_id\`),
        KEY \`idx_power_system_contract_party_b_id\` (\`party_b_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 合同表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `power_system_contract`;');
  }
}
