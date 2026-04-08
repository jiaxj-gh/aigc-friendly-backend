import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemPartyBFromLegacyTable1773927800000 implements MigrationInterface {
  name = 'BackfillPowerSystemPartyBFromLegacyTable1773927800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = (await queryRunner.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'party_b'
    `)) as Array<{ count: number | string }>;
    const legacyTableExists = Number(result[0]?.count ?? 0) > 0;

    if (!legacyTableExists) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_party_b\` (
        \`party_b_id\`,
        \`config_name\`,
        \`company_name\`,
        \`credit_code\`,
        \`company_address\`,
        \`legal_person\`,
        \`contact_person\`,
        \`contact_phone\`,
        \`contact_email\`,
        \`depository_bank\`,
        \`bank_account_no\`,
        \`hot_line\`,
        \`is_default\`,
        \`is_active\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`party_b_id\`,
        legacy.\`config_name\`,
        legacy.\`company_name\`,
        legacy.\`credit_code\`,
        legacy.\`company_address\`,
        legacy.\`legal_person\`,
        legacy.\`contact_person\`,
        legacy.\`contact_phone\`,
        legacy.\`contact_email\`,
        legacy.\`depository_bank\`,
        legacy.\`bank_account_no\`,
        legacy.\`hot_line\`,
        COALESCE(legacy.\`is_default\`, 0),
        COALESCE(legacy.\`is_active\`, 1),
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`party_b\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`power_system_party_b\` target
        WHERE target.\`party_b_id\` = legacy.\`party_b_id\`
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }
}
