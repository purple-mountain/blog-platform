import { redisOptions } from "#/config/redis.config";
import { Redis } from "ioredis";

class RedisClient {
	public readonly client: Redis;

	constructor() {
		this.client = new Redis(redisOptions);
	}

	public async init() {
		try {
			await this.client.connect();

			console.log("Redis connection established.");
		} catch (error) {
			console.error("Redis connection failure. ", error);
		}
	}

	public async set(key: string, value: string | number) {
		return this.client.set(key, value);
	}

	public async get(key: string) {
		return await this.client.get(key);
	}

	public async incr(key: string): Promise<number> {
		return await this.client.incr(key);
	}

	public async decr(key: string): Promise<number> {
		return await this.client.decr(key);
	}

	public async del(key: string): Promise<number> {
		return await this.client.del(key);
	}

	public async exists(key: string): Promise<boolean> {
		return (await this.client.exists(key)) === 0 ? false : true;
	}
}

export const redisClient = new RedisClient();
