import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemPartyAAndPowerSupplyFromLegacyTables1773928000000
  implements MigrationInterface
{
  name = 'BackfillPowerSystemPartyAAndPowerSupplyFromLegacyTables1773928000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const legacyPartyATableExists = await this.hasTable(queryRunner, 'party_a');
    if (legacyPartyATableExists) {
      await queryRunner.query(`
        INSERT INTO \`power_system_party_a\` (
          \`party_a_id\`,
          \`company_name\`,
          \`credit_code\`,
          \`company_address\`,
          \`legal_person\`,
          \`depository_bank\`,
          \`bank_account_no\`,
          \`contact_email\`,
          \`contact_person\`,
          \`contact_phone\`,
          \`is_active\`,
          \`created_at\`,
          \`updated_at\`,
          \`created_by\`,
          \`updated_by\`
        )
        SELECT
          legacy.\`party_a_id\`,
          legacy.\`company_name\`,
          legacy.\`credit_code\`,
          legacy.\`company_address\`,
          legacy.\`legal_person\`,
          legacy.\`depository_bank\`,
          legacy.\`bank_account_no\`,
          legacy.\`contact_email\`,
          legacy.\`contact_person\`,
          legacy.\`contact_phone\`,
          COALESCE(legacy.\`is_active\`, 1),
          COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
          COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
          legacy.\`created_by\`,
          legacy.\`updated_by\`
        FROM \`party_a\` legacy
        WHERE NOT EXISTS (
          SELECT 1
          FROM \`power_system_party_a\` target
          WHERE target.\`party_a_id\` = legacy.\`party_a_id\`
        )
      `);
    }

    const legacyPowerSupplyTableExists = await this.hasTable(queryRunner, 'power_supply');
    if (!legacyPowerSupplyTableExists) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_power_supply\` (
        \`ps_id\`,
        \`party_a_id\`,
        \`power_supply_address\`,
        \`power_supply_number\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`ps_id\`,
        legacy.\`party_a_id\`,
        legacy.\`power_supply_address\`,
        legacy.\`power_supply_number\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`power_supply\` legacy
      WHERE EXISTS (
        SELECT 1
        FROM \`power_system_party_a\` partyA
        WHERE partyA.\`party_a_id\` = legacy.\`party_a_id\`
      )
      AND NOT EXISTS (
        SELECT 1
        FROM \`power_system_power_supply\` target
        WHERE target.\`ps_id\` = legacy.\`ps_id\`
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }

  private async hasTable(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
    const result = (await queryRunner.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
    `, [tableName])) as Array<{ count: number | string }>;

    return Number(result[0]?.count ?? 0) > 0;
  }
}
