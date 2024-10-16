import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/unauthorized.error";
import { UsersRepository } from "#/modules/users/users.repository";
import { verifyToken } from "../utils/verifyToken";
import { generateJwtToken } from "../utils/generateToken";
import { sendCookies } from "../utils/sendCookies";
import { AuthTokenPayload } from "../types/jwt-payload.types";
import { envConfig } from "#/config/env.config";

export async function auth(req: Request, res: Response, next: NextFunction) {
	const accessToken = req?.cookies["accessToken"];
	const refreshToken = req?.cookies["refreshToken"];

	if (!refreshToken) {
		throw new UnauthorizedError("Refresh token not found");
	}

	let accessTokenPayload: AuthTokenPayload | null;

	if (!accessToken) {
		accessTokenPayload = handleTokenRefresh(res, refreshToken);
	} else {
		accessTokenPayload = verifyToken(accessToken);
	}

	if (accessTokenPayload === null) {
		accessTokenPayload = handleTokenRefresh(res, refreshToken);
	}

	const user = await UsersRepository.getOneById({ id: accessTokenPayload["userId"] });

	if (!user) {
		throw new UnauthorizedError("User does not exist");
	}

	req.user = {
		id: user.id,
		role: user.role,
	};

	next();
}

function handleTokenRefresh(res: Response, refreshToken: string) {
	const refreshTokenPayload = verifyToken(refreshToken);

	if (refreshTokenPayload === null) {
		throw new UnauthorizedError("Refresh token has expired");
	}

	const newAccessToken = generateJwtToken(envConfig.JWT_ACCESS_TOKEN_EXPIRATION_TIME, {
		userId: refreshTokenPayload["userId"],
	});

	sendCookies(res, "accessToken", newAccessToken, 15 * 60 * 1000);

	const newAccessTokenPayload = verifyToken(newAccessToken);

	if (!newAccessTokenPayload) {
		throw new UnauthorizedError("Error generating new access token");
	}

	return newAccessTokenPayload;
}
