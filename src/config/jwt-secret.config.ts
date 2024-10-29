import { envConfig } from "./env.config";

function getJwtSecret(): string {
	return envConfig["JWT_SECRET"];
}

export const jwtSecret = getJwtSecret();
