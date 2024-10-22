import { RedisOptions } from "ioredis";
import { envConfig } from "./env.config";

export const redisOptions: RedisOptions = {
	port: Number(envConfig.REDIS_PORT),
	password: envConfig.REDIS_PASSWORD,
	host: envConfig.REDIS_HOST,
	lazyConnect: true,
};
