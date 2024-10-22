import "dotenv/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
import { UsersFactory } from "./factories/users.factory";
import { BlogsFactory } from "./factories/blogs.factory";
import { CommentsFactory } from "./factories/comments.factory";
import { MainSeeder } from "./seeders/main.seeder";
import { dataSourceConfig } from "#/config/data-source.config";

const options: DataSourceOptions & SeederOptions = {
	...dataSourceConfig,
	factories: [UsersFactory, BlogsFactory, CommentsFactory],
	seeds: [MainSeeder],
};

const dataSource = new DataSource(options);

dataSource.initialize().then(async () => {
	await dataSource.runMigrations();
	await runSeeders(dataSource);
	process.exit();
});
