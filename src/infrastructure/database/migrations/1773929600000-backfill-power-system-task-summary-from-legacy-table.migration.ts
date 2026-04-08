import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemTaskSummaryFromLegacyTable1773929600000 implements MigrationInterface {
  name = 'BackfillPowerSystemTaskSummaryFromLegacyTable1773929600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = (await queryRunner.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'task_summary'
    `)) as Array<{ count: number | string }>;
    const legacyTableExists = Number(result[0]?.count ?? 0) > 0;

    if (!legacyTableExists) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_task_summary\` (
        \`task_id\`,
        \`task_name\`,
        \`status\`,
        \`start_time\`,
        \`end_time\`,
        \`upload_summary\`,
        \`compute_summary\`,
        \`error_message\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`task_id\`,
        legacy.\`task_name\`,
        legacy.\`status\`,
        legacy.\`start_time\`,
        legacy.\`end_time\`,
        COALESCE(legacy.\`upload_summary\`, JSON_OBJECT()),
        COALESCE(legacy.\`compute_summary\`, JSON_OBJECT()),
        legacy.\`error_message\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`task_summary\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`power_system_task_summary\` target
        WHERE target.\`task_id\` = legacy.\`task_id\`
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }
}
