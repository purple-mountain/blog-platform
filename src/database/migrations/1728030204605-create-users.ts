import { type MigrationInterface, type QueryRunner } from "typeorm";

export class CreateUsers1728030204605 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(`
        CREATE TYPE role as ENUM ('admin', 'user');
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(255) NOT NULL,
            password CHAR(60) NOT NULL,
            role role NOT NULL DEFAULT 'user',
            created_at TIMESTAMPTZ DEFAULT now()
        );`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		queryRunner.query(`
      DROP TABLE IF EXISTS users;
      DROP TYPE IF EXISTS role;
    `);
	}
}
