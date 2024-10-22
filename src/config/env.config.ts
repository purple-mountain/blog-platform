import { z } from "zod";

const envSchema = z.object({
	SERVER_PORT: z.coerce.number().positive().min(1000).default(3000),

	DATABASE_NAME: z.string(),
	DATABASE_HOST: z.string(),
	DATABASE_PORT: z.string(),
	DATABASE_USER: z.string(),
	DATABASE_PASSWORD: z.string(),

	REDIS_HOST: z.string(),
	REDIS_PASSWORD: z.string(),
	REDIS_PORT: z.string(),

	JWT_SECRET: z.string(),
	JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string(),
	JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string(),
});

export const envConfig = envSchema.parse(process.env);
