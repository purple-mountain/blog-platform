import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeBlogTagsFromSimpleArrayToArray1729500153986
	implements MigrationInterface
{
	name = "ChangeBlogTagsFromSimpleArrayToArrayMigrations1729500153986";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "blog" ALTER COLUMN "tags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "blog" ALTER COLUMN "tags" SET DEFAULT '{}'`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "blog" ALTER COLUMN "tags" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "blog" ALTER COLUMN "tags" DROP NOT NULL`);
	}
}
