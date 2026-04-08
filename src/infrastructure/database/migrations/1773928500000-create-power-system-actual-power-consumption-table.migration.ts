import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePowerSystemActualPowerConsumptionTable1773928500000
  implements MigrationInterface
{
  name = 'CreatePowerSystemActualPowerConsumptionTable1773928500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`power_system_actual_power_consumption\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
        \`seller_company_name\` varchar(255) NOT NULL COMMENT '售电公司名称',
        \`retail_user_name\` varchar(255) DEFAULT NULL COMMENT '零售用户名',
        \`record_date\` date NOT NULL COMMENT '日期',
        \`account_number\` varchar(64) DEFAULT NULL COMMENT '户号',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_power_system_actual_power_consumption_account_date\` (\`account_number\`, \`record_date\`),
        KEY \`idx_power_system_actual_power_consumption_retail_user_name\` (\`retail_user_name\`),
        KEY \`idx_power_system_actual_power_consumption_record_date\` (\`record_date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 实际用电量表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `power_system_actual_power_consumption`;');
  }
}
