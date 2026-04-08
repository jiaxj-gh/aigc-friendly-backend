import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPowerSystemForecastPowerConsumptionAddIntervalColumns1773929300000 implements MigrationInterface {
  name = 'AlterPowerSystemForecastPowerConsumptionAddIntervalColumns1773929300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const firstColumnExists = await queryRunner.hasColumn(
      'power_system_forecast_power_consumption',
      'consumption_0015',
    );

    if (firstColumnExists) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`power_system_forecast_power_consumption\`
        ${buildIntervalDefinitions()
          .map(
            (definition) =>
              `ADD COLUMN \`${definition.columnName}\` double DEFAULT NULL COMMENT '${definition.comment}'`,
          )
          .join(',\n        ')};
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const firstColumnExists = await queryRunner.hasColumn(
      'power_system_forecast_power_consumption',
      'consumption_0015',
    );

    if (!firstColumnExists) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`power_system_forecast_power_consumption\`
        ${buildIntervalDefinitions()
          .map((definition) => `DROP COLUMN \`${definition.columnName}\``)
          .join(',\n        ')};
    `);
  }
}

function buildIntervalDefinitions(): Array<{ columnName: string; comment: string }> {
  const result: Array<{ columnName: string; comment: string }> = [];

  for (let index = 1; index <= 96; index += 1) {
    const totalMinutes = index * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    result.push({
      columnName: `consumption_${label.replace(':', '')}`,
      comment: `${label} 用电量 (kWh)`,
    });
  }

  return result;
}
