import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { DataSourceOptions, EntityTarget, Repository } from "typeorm";
import { SeederOptions } from "typeorm-extension";
import { db } from "../../src/database/database";

export class TestDatabase {
	private container: StartedPostgreSqlContainer | null = null;

	constructor(private config: SeederOptions) {}

	async start(): Promise<void> {
		this.container = await new PostgreSqlContainer().start();

		const options: DataSourceOptions & SeederOptions = {
			type: "postgres",
			host: this.container.getHost(),
			port: this.container.getPort(),
			database: this.container.getDatabase(),
			username: this.container.getUsername(),
			password: this.container.getPassword(),
			factories: this.config.factories,
			seeds: this.config.seeds,
			migrations: [`${__dirname}/../../src/database/migrations/**/*{.ts,.js}`],
			entities: [`${__dirname}/../../src/modules/**/entities/*{.ts,.js}`],
		};

		db.setDataSource(options);

		await db.init();
		await db.runMigrations();
		await db.runSeeders();
	}

	setupRepositories(
		repositories: {
			repository: {
				setRepository: (repository: Repository<any>) => void;
			};
			entity: EntityTarget<any>;
		}[]
	): void {
		for (const { repository, entity } of repositories) {
			repository.setRepository(db.getDataSource().getRepository(entity));
		}
	}

	async stop(): Promise<void> {
		await db.destroy();
		if (this.container) {
			await this.container.stop();
		}
	}
}
