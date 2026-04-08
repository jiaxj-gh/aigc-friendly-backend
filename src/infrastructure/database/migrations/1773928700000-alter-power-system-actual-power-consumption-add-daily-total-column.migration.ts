import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPowerSystemActualPowerConsumptionAddDailyTotalColumn1773928700000
  implements MigrationInterface
{
  name = 'AlterPowerSystemActualPowerConsumptionAddDailyTotalColumn1773928700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`power_system_actual_power_consumption\`
      ADD COLUMN \`daily_total_energy_kwh\` double DEFAULT NULL COMMENT '日总电量 (kWh)'
      AFTER \`account_number\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`power_system_actual_power_consumption\`
      DROP COLUMN \`daily_total_energy_kwh\`
    `);
  }
}
