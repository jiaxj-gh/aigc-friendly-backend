import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemActualPowerConsumptionDailyTotalFromLegacyTable1773928800000
  implements MigrationInterface
{
  name = 'BackfillPowerSystemActualPowerConsumptionDailyTotalFromLegacyTable1773928800000';

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
      UPDATE \`power_system_actual_power_consumption\` target
      INNER JOIN \`actual_power_consumption\` legacy
        ON legacy.\`id\` = target.\`id\`
      SET target.\`daily_total_energy_kwh\` =
        COALESCE(legacy.\`consumption_0015\`, 0) + COALESCE(legacy.\`consumption_0030\`, 0) + COALESCE(legacy.\`consumption_0045\`, 0) + COALESCE(legacy.\`consumption_0100\`, 0) + COALESCE(legacy.\`consumption_0115\`, 0) + COALESCE(legacy.\`consumption_0130\`, 0) + COALESCE(legacy.\`consumption_0145\`, 0) + COALESCE(legacy.\`consumption_0200\`, 0) + COALESCE(legacy.\`consumption_0215\`, 0) + COALESCE(legacy.\`consumption_0230\`, 0) + COALESCE(legacy.\`consumption_0245\`, 0) + COALESCE(legacy.\`consumption_0300\`, 0) + COALESCE(legacy.\`consumption_0315\`, 0) + COALESCE(legacy.\`consumption_0330\`, 0) + COALESCE(legacy.\`consumption_0345\`, 0) + COALESCE(legacy.\`consumption_0400\`, 0) + COALESCE(legacy.\`consumption_0415\`, 0) + COALESCE(legacy.\`consumption_0430\`, 0) + COALESCE(legacy.\`consumption_0445\`, 0) + COALESCE(legacy.\`consumption_0500\`, 0) + COALESCE(legacy.\`consumption_0515\`, 0) + COALESCE(legacy.\`consumption_0530\`, 0) + COALESCE(legacy.\`consumption_0545\`, 0) + COALESCE(legacy.\`consumption_0600\`, 0) + COALESCE(legacy.\`consumption_0615\`, 0) + COALESCE(legacy.\`consumption_0630\`, 0) + COALESCE(legacy.\`consumption_0645\`, 0) + COALESCE(legacy.\`consumption_0700\`, 0) + COALESCE(legacy.\`consumption_0715\`, 0) + COALESCE(legacy.\`consumption_0730\`, 0) + COALESCE(legacy.\`consumption_0745\`, 0) + COALESCE(legacy.\`consumption_0800\`, 0) + COALESCE(legacy.\`consumption_0815\`, 0) + COALESCE(legacy.\`consumption_0830\`, 0) + COALESCE(legacy.\`consumption_0845\`, 0) + COALESCE(legacy.\`consumption_0900\`, 0) + COALESCE(legacy.\`consumption_0915\`, 0) + COALESCE(legacy.\`consumption_0930\`, 0) + COALESCE(legacy.\`consumption_0945\`, 0) + COALESCE(legacy.\`consumption_1000\`, 0) + COALESCE(legacy.\`consumption_1015\`, 0) + COALESCE(legacy.\`consumption_1030\`, 0) + COALESCE(legacy.\`consumption_1045\`, 0) + COALESCE(legacy.\`consumption_1100\`, 0) + COALESCE(legacy.\`consumption_1115\`, 0) + COALESCE(legacy.\`consumption_1130\`, 0) + COALESCE(legacy.\`consumption_1145\`, 0) + COALESCE(legacy.\`consumption_1200\`, 0) + COALESCE(legacy.\`consumption_1215\`, 0) + COALESCE(legacy.\`consumption_1230\`, 0) + COALESCE(legacy.\`consumption_1245\`, 0) + COALESCE(legacy.\`consumption_1300\`, 0) + COALESCE(legacy.\`consumption_1315\`, 0) + COALESCE(legacy.\`consumption_1330\`, 0) + COALESCE(legacy.\`consumption_1345\`, 0) + COALESCE(legacy.\`consumption_1400\`, 0) + COALESCE(legacy.\`consumption_1415\`, 0) + COALESCE(legacy.\`consumption_1430\`, 0) + COALESCE(legacy.\`consumption_1445\`, 0) + COALESCE(legacy.\`consumption_1500\`, 0) + COALESCE(legacy.\`consumption_1515\`, 0) + COALESCE(legacy.\`consumption_1530\`, 0) + COALESCE(legacy.\`consumption_1545\`, 0) + COALESCE(legacy.\`consumption_1600\`, 0) + COALESCE(legacy.\`consumption_1615\`, 0) + COALESCE(legacy.\`consumption_1630\`, 0) + COALESCE(legacy.\`consumption_1645\`, 0) + COALESCE(legacy.\`consumption_1700\`, 0) + COALESCE(legacy.\`consumption_1715\`, 0) + COALESCE(legacy.\`consumption_1730\`, 0) + COALESCE(legacy.\`consumption_1745\`, 0) + COALESCE(legacy.\`consumption_1800\`, 0) + COALESCE(legacy.\`consumption_1815\`, 0) + COALESCE(legacy.\`consumption_1830\`, 0) + COALESCE(legacy.\`consumption_1845\`, 0) + COALESCE(legacy.\`consumption_1900\`, 0) + COALESCE(legacy.\`consumption_1915\`, 0) + COALESCE(legacy.\`consumption_1930\`, 0) + COALESCE(legacy.\`consumption_1945\`, 0) + COALESCE(legacy.\`consumption_2000\`, 0) + COALESCE(legacy.\`consumption_2015\`, 0) + COALESCE(legacy.\`consumption_2030\`, 0) + COALESCE(legacy.\`consumption_2045\`, 0) + COALESCE(legacy.\`consumption_2100\`, 0) + COALESCE(legacy.\`consumption_2115\`, 0) + COALESCE(legacy.\`consumption_2130\`, 0) + COALESCE(legacy.\`consumption_2145\`, 0) + COALESCE(legacy.\`consumption_2200\`, 0) + COALESCE(legacy.\`consumption_2215\`, 0) + COALESCE(legacy.\`consumption_2230\`, 0) + COALESCE(legacy.\`consumption_2245\`, 0) + COALESCE(legacy.\`consumption_2300\`, 0) + COALESCE(legacy.\`consumption_2315\`, 0) + COALESCE(legacy.\`consumption_2330\`, 0) + COALESCE(legacy.\`consumption_2345\`, 0) + COALESCE(legacy.\`consumption_2400\`, 0)
      WHERE target.\`daily_total_energy_kwh\` IS NULL
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }
}
