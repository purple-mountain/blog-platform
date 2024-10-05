import { Response } from "express";

export function sendCookies(res: Response, name: string, data: string, age: number) {
	res.cookie(name, data, {
		httpOnly: true,
		secure: true,
		sameSite: "none",
		maxAge: age,
	});
}
