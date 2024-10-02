import { DataSource } from "typeorm";
import "dotenv/config";

class DbClient {
	public readonly connection = new DataSource({
		type: "postgres",
		host: process.env["DATABASE_HOST"],
		port: Number(process.env["DATABASE_PORT"]),
		username: process.env["DATABASE_USER"],
		password: process.env["DATABASE_PASSWORD"],
		database: process.env["DATABASE_NAME"],
	});

	public async init() {
		await this.connection.initialize();
	}

	public async execute<T, K = unknown>(query: string, params?: K[]): Promise<T[] | T> {
		const queryRunner = this.connection.createQueryRunner();

		try {
			const result = await queryRunner.query(query, params);

			if (result.length === 1) {
				return result[0];
			}

			return result;
		} finally {
			await queryRunner.release();
		}
	}
}

export const db = new DbClient();
