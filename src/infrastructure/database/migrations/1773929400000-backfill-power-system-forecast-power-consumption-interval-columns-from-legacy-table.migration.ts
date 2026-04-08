import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPowerSystemForecastPowerConsumptionIntervalColumnsFromLegacyTable1773929400000 implements MigrationInterface {
  name = 'BackfillPowerSystemForecastPowerConsumptionIntervalColumnsFromLegacyTable1773929400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const legacyTableExists = await hasLegacyTable(queryRunner, 'forecast_power_consumption');
    const targetColumnExists = await queryRunner.hasColumn(
      'power_system_forecast_power_consumption',
      'consumption_0015',
    );

    if (!legacyTableExists || !targetColumnExists) {
      return;
    }

    await queryRunner.query(`
      UPDATE \`power_system_forecast_power_consumption\` target
      INNER JOIN \`forecast_power_consumption\` legacy
        ON legacy.\`id\` = target.\`id\`
      SET
${buildIntervalDefinitions()
  .map(
    (definition) =>
      `        target.\`${definition.columnName}\` = legacy.\`${definition.columnName}\``,
  )
  .join(',\n')};
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Legacy 数据回填不可安全逆转，保留 no-op。
  }
}

async function hasLegacyTable(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
  const result = (await queryRunner.query(`
    SELECT COUNT(*) AS count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = '${tableName}'
  `)) as Array<{ count: number | string }>;

  return Number(result[0]?.count ?? 0) > 0;
}

function buildIntervalDefinitions(): Array<{ columnName: string }> {
  const result: Array<{ columnName: string }> = [];

  for (let index = 1; index <= 96; index += 1) {
    const totalMinutes = index * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const label = `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;

    result.push({
      columnName: `consumption_${label}`,
    });
  }

  return result;
}
