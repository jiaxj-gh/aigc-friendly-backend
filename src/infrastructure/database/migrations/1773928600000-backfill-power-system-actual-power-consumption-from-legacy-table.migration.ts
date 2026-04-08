import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemActualPowerConsumptionFromLegacyTable1773928600000
  implements MigrationInterface
{
  name = 'BackfillPowerSystemActualPowerConsumptionFromLegacyTable1773928600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = (await queryRunner.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'actual_power_consumption'
    `)) as Array<{ count: number | string }>;
    const legacyTableExists = Number(result[0]?.count ?? 0) > 0;

    if (!legacyTableExists) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_actual_power_consumption\` (
        \`id\`,
        \`seller_company_name\`,
        \`retail_user_name\`,
        \`record_date\`,
        \`account_number\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`seller_company_name\`,
        legacy.\`retail_user_name\`,
        legacy.\`record_date\`,
        legacy.\`account_number\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`actual_power_consumption\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`power_system_actual_power_consumption\` target
        WHERE target.\`id\` = legacy.\`id\`
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }
}
