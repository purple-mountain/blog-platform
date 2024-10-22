import { type DataSourceOptions } from "typeorm";
import { envConfig } from "./env.config";

export const dataSourceConfig: DataSourceOptions = {
	type: "postgres",
	host: envConfig.DATABASE_HOST,
	port: Number(envConfig.DATABASE_PORT),
	username: envConfig.DATABASE_USER,
	password: envConfig.DATABASE_PASSWORD,
	database: envConfig.DATABASE_NAME,
	migrations: [`${__dirname}/../database/migrations/**/*{.ts,.js}`],
	entities: [`${__dirname}/../modules/**/entities/*{.ts,.js}`],
};
