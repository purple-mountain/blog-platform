import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";
import { redisClient } from "../../src/redis/redis-client";
import { RedisOptions } from "ioredis";

export class TestRedisClient {
	private connection: StartedRedisContainer | null = null;

	constructor(private config: RedisOptions) {}

	async start() {
		this.connection = await new RedisContainer().start();

		redisClient.setClient({
			port: this.connection.getPort(),
			password: this.connection.getPassword(),
			host: this.connection.getHost(),
			...this.config,
		});
	}

	async stop() {
		if (this.connection) {
			await this.connection.stop();
		}
		await redisClient.destroy();
	}
}
