import { type DataSourceOptions } from "typeorm";

export const dataSourceConfig: DataSourceOptions = {
	type: "postgres",
	host: process.env["DATABASE_HOST"],
	port: Number(process.env["DATABASE_PORT"]),
	username: process.env["DATABASE_USER"],
	password: process.env["DATABASE_PASSWORD"],
	database: process.env["DATABASE_NAME"],
	migrations: [`${__dirname}/../database/migrations/**/*{.ts,.js}`],
	entities: [`${__dirname}/../modules/**/entities/*{.ts,.js}`],
};
