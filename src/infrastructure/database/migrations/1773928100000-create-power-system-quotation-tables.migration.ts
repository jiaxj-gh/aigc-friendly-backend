import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePowerSystemQuotationTables1773928100000 implements MigrationInterface {
  name = 'CreatePowerSystemQuotationTables1773928100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`power_system_quotation\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT '报价 ID',
        \`contract_id\` int NOT NULL COMMENT '合同 ID',
        \`quote_type_id\` int NOT NULL COMMENT '报价类型 ID（1 固定价格，2 比例分成，3 价差浮动）',
        \`green_elec_allow\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否允许绿电',
        \`green_elec_price\` double DEFAULT NULL COMMENT '绿电价格',
        \`trade_start_time\` date NOT NULL COMMENT '交易开始日期',
        \`trade_end_time\` date NOT NULL COMMENT '交易结束日期',
        \`total_electricity\` double NOT NULL COMMENT '总电量',
        \`monthly_electricity\` json NOT NULL COMMENT '月度电量 JSON',
        \`electricity_deviation\` double DEFAULT NULL COMMENT '电量偏差',
        \`positive_deviation_ratio\` double DEFAULT NULL COMMENT '正偏差比例',
        \`positive_deviation_price\` double DEFAULT NULL COMMENT '正偏差价格',
        \`negative_deviation_ratio\` double DEFAULT NULL COMMENT '负偏差比例',
        \`negative_deviation_price\` double DEFAULT NULL COMMENT '负偏差价格',
        \`standard_curve_method\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否标准曲线方式',
        \`curve_modify_days\` int DEFAULT NULL COMMENT '曲线修正天数',
        \`curve_deviation\` double DEFAULT NULL COMMENT '曲线偏差',
        \`curve_positive_ratio\` double DEFAULT NULL COMMENT '曲线正偏差比例',
        \`curve_positive_price\` double DEFAULT NULL COMMENT '曲线正偏差价格',
        \`curve_negative_ratio\` double DEFAULT NULL COMMENT '曲线负偏差比例',
        \`curve_negative_price\` double DEFAULT NULL COMMENT '曲线负偏差价格',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_power_system_quotation_contract_id_quote_type_id\` (\`contract_id\`, \`quote_type_id\`),
        KEY \`idx_power_system_quotation_contract_id_quote_type_id\` (\`contract_id\`, \`quote_type_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 报价主表';
    `);

    await queryRunner.query(`
      CREATE TABLE \`power_system_fixed_price_details\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT '固定价格详情 ID',
        \`quotation_id\` int NOT NULL COMMENT '报价 ID',
        \`fixed_price_ratio\` double NOT NULL DEFAULT 100 COMMENT '固定价格比例',
        \`market_transaction_price\` double DEFAULT NULL COMMENT '市场化交易价格',
        \`price_limit\` double DEFAULT NULL COMMENT '价格上限',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_power_system_fixed_price_details_quotation_id\` (\`quotation_id\`),
        CONSTRAINT \`fk_power_system_fixed_price_details_quotation_id\`
          FOREIGN KEY (\`quotation_id\`) REFERENCES \`power_system_quotation\` (\`id\`)
          ON DELETE CASCADE ON UPDATE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 固定价格报价详情表';
    `);

    await queryRunner.query(`
      CREATE TABLE \`power_system_proportion_sharing_details\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT '比例分成详情 ID',
        \`quotation_id\` int NOT NULL COMMENT '报价 ID',
        \`ps_prop_sharing_ratio\` double NOT NULL DEFAULT 100 COMMENT '分成比例',
        \`ps_dist_ref_price\` double DEFAULT NULL COMMENT '配电参考价',
        \`ps_long_term_trans_ratio\` double DEFAULT NULL COMMENT '长期交易比例',
        \`ps_party_a_prop_below_long_term\` double DEFAULT NULL COMMENT '长期交易下浮甲方分成',
        \`ps_party_b_prop_below_long_term\` double DEFAULT NULL COMMENT '长期交易下浮乙方分成',
        \`ps_party_a_prop_above_long_term\` double DEFAULT NULL COMMENT '长期交易上浮甲方分成',
        \`ps_party_b_prop_above_long_term\` double DEFAULT NULL COMMENT '长期交易上浮乙方分成',
        \`ps_monthly_bid_ratio\` double DEFAULT NULL COMMENT '月度竞价比例',
        \`ps_party_a_prop_below_monthly_bid\` double DEFAULT NULL COMMENT '月度竞价下浮甲方分成',
        \`ps_party_b_prop_below_monthly_bid\` double DEFAULT NULL COMMENT '月度竞价下浮乙方分成',
        \`ps_party_a_prop_above_monthly_bid\` double DEFAULT NULL COMMENT '月度竞价上浮甲方分成',
        \`ps_party_b_prop_above_monthly_bid\` double DEFAULT NULL COMMENT '月度竞价上浮乙方分成',
        \`ps_agent_proc_ratio\` double DEFAULT NULL COMMENT '代理交易比例',
        \`ps_party_a_prop_below_agent_proc\` double DEFAULT NULL COMMENT '代理交易下浮甲方分成',
        \`ps_party_b_prop_below_agent_proc\` double DEFAULT NULL COMMENT '代理交易下浮乙方分成',
        \`ps_party_a_prop_above_agent_proc\` double DEFAULT NULL COMMENT '代理交易上浮甲方分成',
        \`ps_party_b_prop_above_agent_proc\` double DEFAULT NULL COMMENT '代理交易上浮乙方分成',
        \`ps_intra_month_ratio\` double DEFAULT NULL COMMENT '月内挂牌比例',
        \`ps_party_a_prop_below_intra_month\` double DEFAULT NULL COMMENT '月内挂牌下浮甲方分成',
        \`ps_party_b_prop_below_intra_month\` double DEFAULT NULL COMMENT '月内挂牌下浮乙方分成',
        \`ps_party_a_prop_above_intra_month\` double DEFAULT NULL COMMENT '月内挂牌上浮甲方分成',
        \`ps_party_b_prop_above_intra_month\` double DEFAULT NULL COMMENT '月内挂牌上浮乙方分成',
        \`ps_long_term_trans_limit\` double DEFAULT NULL COMMENT '长期交易限价',
        \`ps_monthly_bid_limit\` double DEFAULT NULL COMMENT '月度竞价限价',
        \`ps_agent_proc_limit\` double DEFAULT NULL COMMENT '代理交易限价',
        \`ps_intra_month_limit\` double DEFAULT NULL COMMENT '月内挂牌限价',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_power_system_proportion_sharing_details_quotation_id\` (\`quotation_id\`),
        CONSTRAINT \`fk_power_system_proportion_sharing_details_quotation_id\`
          FOREIGN KEY (\`quotation_id\`) REFERENCES \`power_system_quotation\` (\`id\`)
          ON DELETE CASCADE ON UPDATE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 比例分成报价详情表';
    `);

    await queryRunner.query(`
      CREATE TABLE \`power_system_price_difference_details\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT '价差浮动详情 ID',
        \`quotation_id\` int NOT NULL COMMENT '报价 ID',
        \`pd_price_diff_fluc_ratio\` double NOT NULL DEFAULT 100 COMMENT '价差浮动比例',
        \`pd_long_term_trans_ratio\` double DEFAULT NULL COMMENT '长期交易比例',
        \`pd_long_term_trans_avg_price\` double DEFAULT NULL COMMENT '长期交易均价',
        \`pd_long_term_trans_direction\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '长期交易方向',
        \`pd_monthly_bid_ratio\` double DEFAULT NULL COMMENT '月度竞价比例',
        \`pd_monthly_bid_clear_price\` double DEFAULT NULL COMMENT '月度竞价出清价',
        \`pd_monthly_bid_direction\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '月度竞价方向',
        \`pd_agent_proc_ratio\` double DEFAULT NULL COMMENT '代理交易比例',
        \`pd_agent_avg_price\` double DEFAULT NULL COMMENT '代理交易均价',
        \`pd_agent_direction\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '代理交易方向',
        \`pd_intra_month_ratio\` double DEFAULT NULL COMMENT '月内挂牌比例',
        \`pd_intra_month_avg_price\` double DEFAULT NULL COMMENT '月内挂牌均价',
        \`pd_intra_month_direction\` tinyint(1) NOT NULL DEFAULT 1 COMMENT '月内挂牌方向',
        \`pd_long_term_trans_limit\` double DEFAULT NULL COMMENT '长期交易限价',
        \`pd_monthly_bid_limit\` double DEFAULT NULL COMMENT '月度竞价限价',
        \`pd_agent_proc_limit\` double DEFAULT NULL COMMENT '代理交易限价',
        \`pd_intra_month_limit\` double DEFAULT NULL COMMENT '月内挂牌限价',
        \`created_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间（系统事件时间）',
        \`updated_at\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间（系统事件时间）',
        \`created_by\` varchar(100) DEFAULT NULL COMMENT '创建人标识',
        \`updated_by\` varchar(100) DEFAULT NULL COMMENT '更新人标识',
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_power_system_price_difference_details_quotation_id\` (\`quotation_id\`),
        CONSTRAINT \`fk_power_system_price_difference_details_quotation_id\`
          FOREIGN KEY (\`quotation_id\`) REFERENCES \`power_system_quotation\` (\`id\`)
          ON DELETE CASCADE ON UPDATE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='PowerSystem 价差浮动报价详情表';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `power_system_price_difference_details`;');
    await queryRunner.query('DROP TABLE `power_system_proportion_sharing_details`;');
    await queryRunner.query('DROP TABLE `power_system_fixed_price_details`;');
    await queryRunner.query('DROP TABLE `power_system_quotation`;');
  }
}
