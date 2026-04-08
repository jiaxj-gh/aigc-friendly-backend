import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePowerSystemPartyBTable1773927700000 implements MigrationInterface {
  name = 'CreatePowerSystemPartyBTable1773927700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`power_system_party_b\` (
        \`party_b_id\` int NOT NULL AUTO_INCREMENT COMMENT '乙方主体 ID',
        \`config_name\` varchar(100) NOT NULL COMMENT '配置名称',
        \`company_name\` varchar(255) NOT NULL COMMENT '公司名称',
        \`credit_code\` varchar(50) NOT NULL COMMENT '统一社会信用代码',
        \`company_address\` varchar(255) NOT NULL COMMENT '公司地址',
        \`legal_person\` varchar(100) NOT NULL COMMENT '法人代表',
        \`contact_person\` varchar(100) NOT NULL COMMENT '联系人',
        \`contact_phone\` varchar(30) NOT NULL COMMENT '联系电话',
        \`contact_email\` varchar(100) NOT NULL COMMENT '联系邮箱',
        \`depository_bank\` varchar(100) NOT NULL COMMENT '开户银行',
        \`bank_account_no\` varchar(100) NOT NULL COMMENT '银行账号',
        \`hot_line\` varchar(50) NOT NULL COMMENT '服务热线',
        \`is_default\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否默认主体',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`party_b_id\`),
        KEY \`idx_power_system_party_b_is_active_updated_at\` (\`is_active\`, \`updated_at\`),
        KEY \`idx_power_system_party_b_is_default\` (\`is_default\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 乙方主体配置表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `power_system_party_b`;');
  }
}
