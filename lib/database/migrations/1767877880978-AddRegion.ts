import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegion1767877880978 implements MigrationInterface {
    name = 'AddRegion1767877880978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD COLUMN \`region\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`region\``);
    }

}
