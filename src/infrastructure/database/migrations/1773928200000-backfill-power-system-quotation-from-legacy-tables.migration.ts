import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemQuotationFromLegacyTables1773928200000
  implements MigrationInterface
{
  name = 'BackfillPowerSystemQuotationFromLegacyTables1773928200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const legacyQuotationTableExists = await this.hasTable(queryRunner, 'quotation');
    if (legacyQuotationTableExists) {
      await queryRunner.query(`
        INSERT INTO \`power_system_quotation\` (
          \`id\`,
          \`contract_id\`,
          \`quote_type_id\`,
          \`green_elec_allow\`,
          \`green_elec_price\`,
          \`trade_start_time\`,
          \`trade_end_time\`,
          \`total_electricity\`,
          \`monthly_electricity\`,
          \`electricity_deviation\`,
          \`positive_deviation_ratio\`,
          \`positive_deviation_price\`,
          \`negative_deviation_ratio\`,
          \`negative_deviation_price\`,
          \`standard_curve_method\`,
          \`curve_modify_days\`,
          \`curve_deviation\`,
          \`curve_positive_ratio\`,
          \`curve_positive_price\`,
          \`curve_negative_ratio\`,
          \`curve_negative_price\`,
          \`created_at\`,
          \`updated_at\`,
          \`created_by\`,
          \`updated_by\`
        )
        SELECT
          legacy.\`id\`,
          legacy.\`contract_id\`,
          legacy.\`quote_type_id\`,
          COALESCE(legacy.\`green_elec_allow\`, 1),
          legacy.\`green_elec_price\`,
          legacy.\`trade_start_time\`,
          legacy.\`trade_end_time\`,
          legacy.\`total_electricity\`,
          legacy.\`monthly_electricity\`,
          legacy.\`electricity_deviation\`,
          legacy.\`positive_deviation_ratio\`,
          legacy.\`positive_deviation_price\`,
          legacy.\`negative_deviation_ratio\`,
          legacy.\`negative_deviation_price\`,
          COALESCE(legacy.\`standard_curve_method\`, 0),
          legacy.\`curve_modify_days\`,
          legacy.\`curve_deviation\`,
          legacy.\`curve_positive_ratio\`,
          legacy.\`curve_positive_price\`,
          legacy.\`curve_negative_ratio\`,
          legacy.\`curve_negative_price\`,
          COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
          COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
          legacy.\`created_by\`,
          legacy.\`updated_by\`
        FROM \`quotation\` legacy
        WHERE NOT EXISTS (
          SELECT 1
          FROM \`power_system_quotation\` target
          WHERE target.\`id\` = legacy.\`id\`
        )
      `);
    }

    await this.backfillFixedPriceDetails(queryRunner);
    await this.backfillProportionSharingDetails(queryRunner);
    await this.backfillPriceDifferenceDetails(queryRunner);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }

  private async backfillFixedPriceDetails(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasTable(queryRunner, 'fixed_price_details'))) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_fixed_price_details\` (
        \`id\`,
        \`quotation_id\`,
        \`fixed_price_ratio\`,
        \`market_transaction_price\`,
        \`price_limit\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`quotation_id\`,
        COALESCE(legacy.\`fixed_price_ratio\`, 100),
        legacy.\`market_transaction_price\`,
        legacy.\`price_limit\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`fixed_price_details\` legacy
      WHERE EXISTS (
        SELECT 1
        FROM \`power_system_quotation\` quotation
        WHERE quotation.\`id\` = legacy.\`quotation_id\`
      )
      AND NOT EXISTS (
        SELECT 1
        FROM \`power_system_fixed_price_details\` target
        WHERE target.\`id\` = legacy.\`id\`
      )
    `);
  }

  private async backfillProportionSharingDetails(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasTable(queryRunner, 'proportion_sharing_details'))) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_proportion_sharing_details\` (
        \`id\`,
        \`quotation_id\`,
        \`ps_prop_sharing_ratio\`,
        \`ps_dist_ref_price\`,
        \`ps_long_term_trans_ratio\`,
        \`ps_party_a_prop_below_long_term\`,
        \`ps_party_b_prop_below_long_term\`,
        \`ps_party_a_prop_above_long_term\`,
        \`ps_party_b_prop_above_long_term\`,
        \`ps_monthly_bid_ratio\`,
        \`ps_party_a_prop_below_monthly_bid\`,
        \`ps_party_b_prop_below_monthly_bid\`,
        \`ps_party_a_prop_above_monthly_bid\`,
        \`ps_party_b_prop_above_monthly_bid\`,
        \`ps_agent_proc_ratio\`,
        \`ps_party_a_prop_below_agent_proc\`,
        \`ps_party_b_prop_below_agent_proc\`,
        \`ps_party_a_prop_above_agent_proc\`,
        \`ps_party_b_prop_above_agent_proc\`,
        \`ps_intra_month_ratio\`,
        \`ps_party_a_prop_below_intra_month\`,
        \`ps_party_b_prop_below_intra_month\`,
        \`ps_party_a_prop_above_intra_month\`,
        \`ps_party_b_prop_above_intra_month\`,
        \`ps_long_term_trans_limit\`,
        \`ps_monthly_bid_limit\`,
        \`ps_agent_proc_limit\`,
        \`ps_intra_month_limit\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`quotation_id\`,
        COALESCE(legacy.\`ps_prop_sharing_ratio\`, 100),
        legacy.\`ps_dist_ref_price\`,
        legacy.\`ps_long_term_trans_ratio\`,
        legacy.\`ps_party_a_prop_below_long_term\`,
        legacy.\`ps_party_b_prop_below_long_term\`,
        legacy.\`ps_party_a_prop_above_long_term\`,
        legacy.\`ps_party_b_prop_above_long_term\`,
        legacy.\`ps_monthly_bid_ratio\`,
        legacy.\`ps_party_a_prop_below_monthly_bid\`,
        legacy.\`ps_party_b_prop_below_monthly_bid\`,
        legacy.\`ps_party_a_prop_above_monthly_bid\`,
        legacy.\`ps_party_b_prop_above_monthly_bid\`,
        legacy.\`ps_agent_proc_ratio\`,
        legacy.\`ps_party_a_prop_below_agent_proc\`,
        legacy.\`ps_party_b_prop_below_agent_proc\`,
        legacy.\`ps_party_a_prop_above_agent_proc\`,
        legacy.\`ps_party_b_prop_above_agent_proc\`,
        legacy.\`ps_intra_month_ratio\`,
        legacy.\`ps_party_a_prop_below_intra_month\`,
        legacy.\`ps_party_b_prop_below_intra_month\`,
        legacy.\`ps_party_a_prop_above_intra_month\`,
        legacy.\`ps_party_b_prop_above_intra_month\`,
        legacy.\`ps_long_term_trans_limit\`,
        legacy.\`ps_monthly_bid_limit\`,
        legacy.\`ps_agent_proc_limit\`,
        legacy.\`ps_intra_month_limit\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`proportion_sharing_details\` legacy
      WHERE EXISTS (
        SELECT 1
        FROM \`power_system_quotation\` quotation
        WHERE quotation.\`id\` = legacy.\`quotation_id\`
      )
      AND NOT EXISTS (
        SELECT 1
        FROM \`power_system_proportion_sharing_details\` target
        WHERE target.\`id\` = legacy.\`id\`
      )
    `);
  }

  private async backfillPriceDifferenceDetails(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.hasTable(queryRunner, 'price_difference_details'))) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO \`power_system_price_difference_details\` (
        \`id\`,
        \`quotation_id\`,
        \`pd_price_diff_fluc_ratio\`,
        \`pd_long_term_trans_ratio\`,
        \`pd_long_term_trans_avg_price\`,
        \`pd_long_term_trans_direction\`,
        \`pd_monthly_bid_ratio\`,
        \`pd_monthly_bid_clear_price\`,
        \`pd_monthly_bid_direction\`,
        \`pd_agent_proc_ratio\`,
        \`pd_agent_avg_price\`,
        \`pd_agent_direction\`,
        \`pd_intra_month_ratio\`,
        \`pd_intra_month_avg_price\`,
        \`pd_intra_month_direction\`,
        \`pd_long_term_trans_limit\`,
        \`pd_monthly_bid_limit\`,
        \`pd_agent_proc_limit\`,
        \`pd_intra_month_limit\`,
        \`created_at\`,
        \`updated_at\`,
        \`created_by\`,
        \`updated_by\`
      )
      SELECT
        legacy.\`id\`,
        legacy.\`quotation_id\`,
        COALESCE(legacy.\`pd_price_diff_fluc_ratio\`, 100),
        legacy.\`pd_long_term_trans_ratio\`,
        legacy.\`pd_long_term_trans_avg_price\`,
        COALESCE(legacy.\`pd_long_term_trans_direction\`, 1),
        legacy.\`pd_monthly_bid_ratio\`,
        legacy.\`pd_monthly_bid_clear_price\`,
        COALESCE(legacy.\`pd_monthly_bid_direction\`, 1),
        legacy.\`pd_agent_proc_ratio\`,
        legacy.\`pd_agent_avg_price\`,
        COALESCE(legacy.\`pd_agent_direction\`, 1),
        legacy.\`pd_intra_month_ratio\`,
        legacy.\`pd_intra_month_avg_price\`,
        COALESCE(legacy.\`pd_intra_month_direction\`, 1),
        legacy.\`pd_long_term_trans_limit\`,
        legacy.\`pd_monthly_bid_limit\`,
        legacy.\`pd_agent_proc_limit\`,
        legacy.\`pd_intra_month_limit\`,
        COALESCE(legacy.\`created_at\`, CURRENT_TIMESTAMP(3)),
        COALESCE(legacy.\`updated_at\`, CURRENT_TIMESTAMP(3)),
        legacy.\`created_by\`,
        legacy.\`updated_by\`
      FROM \`price_difference_details\` legacy
      WHERE EXISTS (
        SELECT 1
        FROM \`power_system_quotation\` quotation
        WHERE quotation.\`id\` = legacy.\`quotation_id\`
      )
      AND NOT EXISTS (
        SELECT 1
        FROM \`power_system_price_difference_details\` target
        WHERE target.\`id\` = legacy.\`id\`
      )
    `);
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
