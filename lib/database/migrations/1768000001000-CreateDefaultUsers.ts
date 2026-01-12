import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcryptjs";

export class CreateDefaultUsers1768000001000 implements MigrationInterface {
  name = 'CreateDefaultUsers1768000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get role IDs
    const [userRole] = await queryRunner.query(`
      SELECT id FROM \`roles\` WHERE name = 'user' LIMIT 1
    `);
    const [superAdminRole] = await queryRunner.query(`
      SELECT id FROM \`roles\` WHERE name = 'super_admin' LIMIT 1
    `);

    if (!userRole || !superAdminRole) {
      throw new Error("Roles not found. Please run CreateRolesAndPermissions migration first.");
    }

    const userRoleId = userRole.id;
    const superAdminRoleId = superAdminRole.id;

    // Hash passwords
    const superAdminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    // Create super admin user
    await queryRunner.query(`
      INSERT INTO \`users\` (\`uuid\`, \`username\`, \`email\`, \`password\`, \`role_id\`) 
      VALUES (UUID(), 'admin', 'admin@controlplane.com', ?, ?)
    `, [superAdminPassword, superAdminRoleId]);

    // Create regular user
    await queryRunner.query(`
      INSERT INTO \`users\` (\`uuid\`, \`username\`, \`email\`, \`password\`, \`role_id\`) 
      VALUES (UUID(), 'user', 'user@controlplane.com', ?, ?)
    `, [userPassword, userRoleId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`users\` WHERE username IN ('admin', 'user')`);
  }
}

