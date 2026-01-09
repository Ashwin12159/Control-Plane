import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLog1767875610646 implements MigrationInterface {
    name = 'CreateAuditLog1767875610646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\`INT AUTO_INCREMENT PRIMARY KEY NOT NULL , \`uuid\` varchar(36) NOT NULL DEFAULT uuid(), \`action\` varchar(255) NOT NULL, \`payload\` text DEFAULT NULL, \`doneBy\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_951b8f1dfc94ac1d0301a14b7e\` (\`uuid\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_951b8f1dfc94ac1d0301a14b7e\` ON \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }

}
