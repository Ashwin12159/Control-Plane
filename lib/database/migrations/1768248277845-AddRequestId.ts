import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRequestId1768248277845 implements MigrationInterface {
    name = 'AddRequestId1768248277845'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE audit_logs
            ADD COLUMN request_id VARCHAR(255) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE audit_logs
            DROP COLUMN request_id
        `);
    }

}
