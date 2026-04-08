import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePowerSystemPartyAAndPowerSupplyTables1773927900000
  implements MigrationInterface
{
  name = 'CreatePowerSystemPartyAAndPowerSupplyTables1773927900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`power_system_party_a\` (
        \`party_a_id\` int NOT NULL AUTO_INCREMENT COMMENT '甲方主体 ID',
        \`company_name\` varchar(255) NOT NULL COMMENT '公司名称',
        \`credit_code\` varchar(50) DEFAULT NULL COMMENT '统一社会信用代码',
        \`company_address\` varchar(255) DEFAULT NULL COMMENT '公司地址',
        \`legal_person\` varchar(100) DEFAULT NULL COMMENT '法人代表',
        \`depository_bank\` varchar(100) DEFAULT NULL COMMENT '开户银行',
        \`bank_account_no\` varchar(100) DEFAULT NULL COMMENT '银行账号',
        \`contact_email\` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
        \`contact_person\` varchar(100) DEFAULT NULL COMMENT '联系人',
        \`contact_phone\` varchar(30) DEFAULT NULL COMMENT '联系电话',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`party_a_id\`),
        KEY \`idx_power_system_party_a_is_active_updated_at\` (\`is_active\`, \`updated_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 甲方主体表';
    `);

    await queryRunner.query(`
      CREATE TABLE \`power_system_power_supply\` (
        \`ps_id\` int NOT NULL AUTO_INCREMENT COMMENT '供电信息 ID',
        \`party_a_id\` int NOT NULL COMMENT '甲方主体 ID',
        \`power_supply_address\` varchar(255) NOT NULL COMMENT '供电地址',
        \`power_supply_number\` varchar(255) NOT NULL COMMENT '供电户号',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`ps_id\`),
        KEY \`idx_power_system_power_supply_party_a_id\` (\`party_a_id\`),
        CONSTRAINT \`fk_power_system_power_supply_party_a_id\`
          FOREIGN KEY (\`party_a_id\`) REFERENCES \`power_system_party_a\` (\`party_a_id\`)
          ON DELETE CASCADE ON UPDATE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 供电信息表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `power_system_power_supply`;');
    await queryRunner.query('DROP TABLE `power_system_party_a`;');
  }
}
