import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemContractFromLegacyTable1773928400000
  implements MigrationInterface
{
  name = 'BackfillPowerSystemContractFromLegacyTable1773928400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const legacyContractTableExists = await this.hasTable(queryRunner, 'contract');
    if (!legacyContractTableExists) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_contract\` (
        \`contract_id\`,
        \`contract_current_status\`,
        \`is_active\`,
        \`work_order_number\`,
        \`confirmation_method\`,
        \`party_a_contract_no\`,
        \`party_b_contract_no\`,
        \`submission_time\`,
        \`confirmation_time\`,
        \`contract_sign_date\`,
        \`party_a_sign_date\`,
        \`party_b_sign_date\`,
        \`order_time\`,
        \`sign_location\`,
        \`additional_terms\`,
        \`dispute_resolution_method\`,
        \`filing_method\`,
        \`filing_party\`,
        \`party_b_termination_before30\`,
        \`party_b_termination_other\`,
        \`party_b_termination_active\`,
        \`party_a_termination_before30\`,
        \`party_a_termination_in30\`,
        \`party_a_termination_active\`,
        \`original_copies\`,
        \`duplicate_copies\`,
        \`party_a_custom\`,
        \`party_a_custom_company\`,
        \`party_a_custom_credit_code\`,
        \`party_a_custom_legal_person\`,
        \`party_a_custom_address\`,
        \`party_a_custom_bank\`,
        \`party_a_custom_bank_account\`,
        \`party_a_custom_contact_person\`,
        \`party_a_custom_contact_phone\`,
        \`party_a_id\`,
        \`party_b_id\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`contract_id\`,
        legacy.\`contract_current_status\`,
        COALESCE(legacy.\`is_active\`, 1),
        legacy.\`work_order_number\`,
        COALESCE(legacy.\`confirmation_method\`, '电子确认'),
        legacy.\`party_a_contract_no\`,
        legacy.\`party_b_contract_no\`,
        legacy.\`submission_time\`,
        legacy.\`confirmation_time\`,
        legacy.\`contract_sign_date\`,
        legacy.\`party_a_sign_date\`,
        legacy.\`party_b_sign_date\`,
        legacy.\`order_time\`,
        legacy.\`sign_location\`,
        legacy.\`additional_terms\`,
        COALESCE(legacy.\`dispute_resolution_method\`, '2'),
        COALESCE(legacy.\`filing_method\`, '2'),
        COALESCE(legacy.\`filing_party\`, '乙'),
        legacy.\`party_b_termination_before30\`,
        legacy.\`party_b_termination_other\`,
        legacy.\`party_b_termination_active\`,
        legacy.\`party_a_termination_before30\`,
        legacy.\`party_a_termination_in30\`,
        legacy.\`party_a_termination_active\`,
        COALESCE(legacy.\`original_copies\`, 2),
        COALESCE(legacy.\`duplicate_copies\`, 1),
        COALESCE(legacy.\`party_a_custom\`, 0),
        legacy.\`party_a_custom_company\`,
        legacy.\`party_a_custom_credit_code\`,
        legacy.\`party_a_custom_legal_person\`,
        legacy.\`party_a_custom_address\`,
        legacy.\`party_a_custom_bank\`,
        legacy.\`party_a_custom_bank_account\`,
        legacy.\`party_a_custom_contact_person\`,
        legacy.\`party_a_custom_contact_phone\`,
        legacy.\`party_a_id\`,
        legacy.\`party_b_id\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`contract\` legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`power_system_contract\` target
        WHERE target.\`contract_id\` = legacy.\`contract_id\`
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }

  private async hasTable(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
    const result = (await queryRunner.query(
      `
        SELECT COUNT(*) AS count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = ?
      `,
      [tableName],
    )) as Array<{ count: number | string }>;

    return Number(result[0]?.count ?? 0) > 0;
  }
}
