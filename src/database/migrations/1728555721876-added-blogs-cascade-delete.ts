import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedBlogsCascadeDelete1728555721876 implements MigrationInterface {
	name = "AddedBlogsCascadeDelete1728555721876";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "blog" DROP CONSTRAINT "FK_05aa4239904d894452e339e5139"`
		);
		await queryRunner.query(
			`ALTER TABLE "blog" ADD CONSTRAINT "FK_05aa4239904d894452e339e5139" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "blog" DROP CONSTRAINT "FK_05aa4239904d894452e339e5139"`
		);
		await queryRunner.query(
			`ALTER TABLE "blog" ADD CONSTRAINT "FK_05aa4239904d894452e339e5139" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}
}
