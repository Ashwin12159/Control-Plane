import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesAndPermissions1768000000000 implements MigrationInterface {
  name = 'CreateRolesAndPermissions1768000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.query(`
      CREATE TABLE \`roles\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`description\` text,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_roles_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE \`permissions\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`displayName\` varchar(255) NOT NULL,
        \`description\` text,
        \`isActive\` tinyint(1) NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_permissions_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Add role_id column to users table (one role per user)
    await queryRunner.query(`
      ALTER TABLE \`users\` 
      ADD COLUMN \`role_id\` varchar(36) NULL,
      ADD INDEX \`IDX_users_role_id\` (\`role_id\`),
      ADD CONSTRAINT \`FK_users_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create role_permissions junction table
    await queryRunner.query(`
      CREATE TABLE \`role_permissions\` (
        \`role_id\` varchar(36) NOT NULL,
        \`permission_id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`role_id\`, \`permission_id\`),
        INDEX \`IDX_role_permissions_role_id\` (\`role_id\`),
        INDEX \`IDX_role_permissions_permission_id\` (\`permission_id\`),
        CONSTRAINT \`FK_role_permissions_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_role_permissions_permission\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Insert default roles (using fixed UUIDs for consistency)
    const userRoleId = '00000000-0000-0000-0000-000000000001';
    const superAdminRoleId = '00000000-0000-0000-0000-000000000002';
    
    await queryRunner.query(`
      INSERT INTO \`roles\` (\`id\`, \`name\`, \`description\`) VALUES
      ('${userRoleId}', 'user', 'Regular user with limited permissions'),
      ('${superAdminRoleId}', 'super_admin', 'Super administrator with full access to all tools')
    `);

    // Insert default permissions for all tools (using fixed UUIDs)
    const permissionIds = {
      rabbitmq: '10000000-0000-0000-0000-000000000001',
      'check-sync': '10000000-0000-0000-0000-000000000002',
      'numbers-not-in-bifrost': '10000000-0000-0000-0000-000000000003',
      'numbers-not-in-cache': '10000000-0000-0000-0000-000000000004',
      'generate-signed-url': '10000000-0000-0000-0000-000000000005',
      'call-details': '10000000-0000-0000-0000-000000000006',
      'list-practices': '10000000-0000-0000-0000-000000000007',
    };

    await queryRunner.query(`
      INSERT INTO \`permissions\` (\`id\`, \`name\`, \`displayName\`, \`description\`) VALUES
      ('${permissionIds.rabbitmq}', 'rabbitmq', 'RabbitMQ Queue', 'Push messages to RabbitMQ queues'),
      ('${permissionIds['check-sync']}', 'check-sync', 'Check Sync', 'Check sync status for devices, locations, and practices'),
      ('${permissionIds['numbers-not-in-bifrost']}', 'numbers-not-in-bifrost', 'Numbers Not in Bifrost', 'Get numbers not associated with a trunk in Bifrost'),
      ('${permissionIds['numbers-not-in-cache']}', 'numbers-not-in-cache', 'Numbers Not in Cache', 'Get numbers not in number cache'),
      ('${permissionIds['generate-signed-url']}', 'generate-signed-url', 'Generate Signed URL', 'Generate signed URLs for S3 recordings'),
      ('${permissionIds['call-details']}', 'call-details', 'Call Details', 'Search and view call details'),
      ('${permissionIds['list-practices']}', 'list-practices', 'List Practices', 'List all practices')
    `);

    // Grant all permissions to super_admin role
    await queryRunner.query(`
      INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
      SELECT '${superAdminRoleId}', id
      FROM \`permissions\`
    `);

    // Grant specific permissions to user role: call-details, numbers-not-in-cache, check-sync
    await queryRunner.query(`
      INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
      VALUES
        ('${userRoleId}', '${permissionIds['call-details']}'),
        ('${userRoleId}', '${permissionIds['numbers-not-in-cache']}'),
        ('${userRoleId}', '${permissionIds['check-sync']}')
    `);

    // Set default role for all existing users to 'user' role
    await queryRunner.query(`
      UPDATE \`users\` 
      SET \`role_id\` = '${userRoleId}'
      WHERE \`role_id\` IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_users_role\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_users_role_id\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role_id\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`role_permissions\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`permissions\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`roles\``);
  }
}

