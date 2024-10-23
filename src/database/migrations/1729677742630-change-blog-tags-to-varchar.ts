import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTagsFromTextToVarChar1729677742630 implements MigrationInterface {
	name = "ChangeTagsFromTextToVarChar1729677742630";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "tags"`);
		await queryRunner.query(
			`ALTER TABLE "blog" ADD "tags" character varying(255) array NOT NULL DEFAULT '{}'`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "blog" DROP COLUMN "tags"`);
		await queryRunner.query(`ALTER TABLE "blog" ADD "tags" text NOT NULL DEFAULT '{}'`);
	}
}
