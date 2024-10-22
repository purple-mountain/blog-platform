import { app } from "#/app";
import { db } from "#/database/database";
import { envConfig } from "./config/env.config";
import { redisClient } from "./redis/redis-client";

async function main() {
	await db.init();
	await redisClient.init();

	app.listen(envConfig.SERVER_PORT, () => {
		console.log(`Server is running on http://localhost:${envConfig.SERVER_PORT}`);
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
