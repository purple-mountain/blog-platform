function getJwtSecret(): string {
	const secret = process.env["JWT_SECRET"];

	if (!secret) {
		throw new Error("JWT_SECRET environment variable is not defined");
	}

	return secret;
}

export const jwtSecret = getJwtSecret();
