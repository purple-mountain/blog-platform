import { jwtSecret } from "#/config/jwt-secret.config";
import jwt from "jsonwebtoken";
import { AuthTokenPayload } from "../types/jwtPayload";

export function generateJwtToken(
	expirationTime: string,
	payload: AuthTokenPayload
): string {
	const jwt_secret = jwtSecret;

	return jwt.sign(payload, jwt_secret, {
		expiresIn: expirationTime,
	});
}
