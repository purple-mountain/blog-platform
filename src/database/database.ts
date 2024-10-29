import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { dataSourceConfig } from "../config/data-source.config";
import { runSeeders } from "typeorm-extension";

class DbClient {
	private connection: DataSource;

	constructor() {
		this.connection = new DataSource(dataSourceConfig);
	}

	public async init() {
		if (!this.connection.isInitialized) {
			await this.connection.initialize();
		}
	}

	public async destroy() {
		if (this.connection.isInitialized) {
			await this.connection.destroy();
		}
	}

	public setDataSource(options: DataSourceOptions) {
		this.connection = new DataSource(options);
	}

	public getDataSource() {
		return this.connection;
	}

	public async runMigrations() {
		await this.connection.runMigrations();
	}

	public async runSeeders() {
		await runSeeders(this.connection);
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
