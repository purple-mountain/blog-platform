import { validateRequestBody } from "#/shared/validators/request-body.validator";
import { Router } from "express";
import { AuthService } from "./auth.service";
import { loginRequestBodyDtoSchema } from "./dto/request/login-request-body.dto";
import { signUpRequestBodyDtoSchema } from "./dto/request/sign-up-request-body.dto";
import { sendCookies } from "#/shared/utils/sendCookies";
import "express-async-errors";

export const AuthController = Router();

AuthController.post(
	"/login",
	validateRequestBody(loginRequestBodyDtoSchema),
	async (req, res) => {
		const { user, accessToken, refreshToken } = await AuthService.login(req.body);

		sendCookies(res, "accessToken", accessToken, 15 * 60 * 1000);
		sendCookies(res, "refreshToken", refreshToken, 7 * 24 * 60 * 60 * 1000);

		return res.status(200).json({ data: user, message: "User logged in successfully" });
	}
);

AuthController.post(
	"/sign-up",
	validateRequestBody(signUpRequestBodyDtoSchema),
	async (req, res) => {
		const { newUser, accessToken, refreshToken } = await AuthService.signUp(req.body);

		sendCookies(res, "accessToken", accessToken, 15 * 60 * 1000);
		sendCookies(res, "refreshToken", refreshToken, 7 * 24 * 60 * 60 * 1000);

		return res
			.status(201)
			.json({ data: newUser, message: "User signed up successfully" });
	}
);
