import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExportCallDetailsPermission1768000002000 implements MigrationInterface {
  name = 'AddExportCallDetailsPermission1768000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const superAdminRoleId = '00000000-0000-0000-0000-000000000002';
    const exportPermissionId = '10000000-0000-0000-0000-000000000008';

    // Insert the new permission
    await queryRunner.query(`
      INSERT INTO \`permissions\` (\`id\`, \`name\`, \`displayName\`, \`description\`) VALUES
      ('${exportPermissionId}', 'export-call-details', 'Export Call Details', 'Export complete call details from MongoDB')
    `);

    // Grant permission to super_admin role
    await queryRunner.query(`
      INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
      VALUES ('${superAdminRoleId}', '${exportPermissionId}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const exportPermissionId = '10000000-0000-0000-0000-000000000008';
    
    // Remove permission from role_permissions
    await queryRunner.query(`
      DELETE FROM \`role_permissions\` WHERE \`permission_id\` = '${exportPermissionId}'
    `);

    // Remove the permission
    await queryRunner.query(`
      DELETE FROM \`permissions\` WHERE \`id\` = '${exportPermissionId}'
    `);
  }
}

