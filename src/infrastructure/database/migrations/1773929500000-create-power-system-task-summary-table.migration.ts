import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePowerSystemTaskSummaryTable1773929500000 implements MigrationInterface {
  name = 'CreatePowerSystemTaskSummaryTable1773929500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`power_system_task_summary\` (
        \`task_id\` int NOT NULL AUTO_INCREMENT COMMENT '任务 ID',
        \`task_name\` varchar(255) DEFAULT NULL COMMENT '任务名称',
        \`status\` varchar(32) NOT NULL COMMENT '任务状态',
        \`start_time\` datetime DEFAULT NULL COMMENT '任务开始时间',
        \`end_time\` datetime DEFAULT NULL COMMENT '任务结束时间',
        \`upload_summary\` json NOT NULL COMMENT '上传阶段详情 JSON',
        \`compute_summary\` json NOT NULL COMMENT '计算阶段详情 JSON',
        \`error_message\` text DEFAULT NULL COMMENT '任务异常信息',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`task_id\`),
        KEY \`idx_power_system_task_summary_status\` (\`status\`),
        KEY \`idx_power_system_task_summary_start_time\` (\`start_time\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 用电任务汇总表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `power_system_task_summary`;');
  }
}
