import { DataSource } from "typeorm";
import "dotenv/config";
import { dataSourceConfig } from "../config/dataSource.config";

export const AppDataSource = new DataSource(dataSourceConfig);

class DbClient {
	public readonly connection: DataSource = AppDataSource;

	public async init() {
		await this.connection.initialize();
	}

	public async execute<T, K = unknown>(query: string, params?: K[]): Promise<T[]> {
		const queryRunner = this.connection.createQueryRunner();

		try {
			const result = await queryRunner.query(query, params);

			return result;
		} finally {
			await queryRunner.release();
		}
	}
}

export const db = new DbClient();
