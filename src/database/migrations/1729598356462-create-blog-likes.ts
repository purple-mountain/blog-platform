import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlogLikes1729598356462 implements MigrationInterface {
	name = "CreateBlogLikes1729598356462";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "blog_like" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "liked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "blogId" uuid, CONSTRAINT "UQ_831a046b0c8ae9f2e64575dac25" UNIQUE ("userId", "blogId"), CONSTRAINT "PK_5d585611bb427ede279c3f55572" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "blog_like" ADD CONSTRAINT "FK_8593bfadb48f1d071b7f870a3ae" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`ALTER TABLE "blog_like" ADD CONSTRAINT "FK_829d592b8a4efff93ce9dd5a1c6" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "blog_like" DROP CONSTRAINT "FK_829d592b8a4efff93ce9dd5a1c6"`
		);
		await queryRunner.query(
			`ALTER TABLE "blog_like" DROP CONSTRAINT "FK_8593bfadb48f1d071b7f870a3ae"`
		);
		await queryRunner.query(`DROP TABLE "blog_like"`);
	}
}
