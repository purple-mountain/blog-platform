import { envConfig } from "#/config/env.config";
import { Response } from "express";

export function sendCookies(res: Response, name: string, data: string, age: number) {
	res.cookie(name, data, {
		httpOnly: true,
		secure: envConfig["NODE_ENV"] === "production",
		sameSite: envConfig["NODE_ENV"] === "production" ? "strict" : "none",
		maxAge: age,
	});
}
