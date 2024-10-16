import { jwtSecret } from "#/config/jwt-secret.config";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { AuthTokenPayload } from "../types/jwt-payload.types";
import { UnauthorizedError } from "../errors/unauthorized.error";

export function verifyToken(token: string): AuthTokenPayload | null {
	try {
		const tokenPayload = jwt.verify(token, jwtSecret) as AuthTokenPayload;

		return tokenPayload;
	} catch (error) {
		if (error instanceof JsonWebTokenError) {
			if (error instanceof jwt.TokenExpiredError) {
				return null;
			}

			throw new UnauthorizedError("Invalid token");
		}

		throw error;
	}
}
