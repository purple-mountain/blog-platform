import { LoginRequestBodyDto } from "./dto/request/login-request-body.dto";
import bcrypt from "bcrypt";
import { SignUpRequestBodyDto } from "./dto/request/sign-up-request-body.dto";
import { UsersRepository } from "../users/users.repository";
import { BadRequestError } from "#/shared/errors/bad-request.error";
import { UnauthorizedError } from "#/shared/errors/unauthorized.error";
import { generateJwtToken } from "#/shared/utils/generate-token";
import { User } from "../users/entities/user.entity";
import { envConfig } from "#/config/env.config";

export class AuthService {
	static async login(
		loginData: LoginRequestBodyDto
	): Promise<{ user: User; accessToken: string; refreshToken: string }> {
		const foundUser = await UsersRepository.getOneByEmail({ email: loginData.email });

		if (!foundUser) {
			throw new UnauthorizedError("User does not exist");
		}

		const isPasswordCorrect = await bcrypt.compare(
			loginData.password,
			foundUser.password
		);

		if (!isPasswordCorrect) {
			throw new UnauthorizedError("Password is incorrect");
		}

		const accessToken = generateJwtToken(envConfig.JWT_ACCESS_TOKEN_EXPIRATION_TIME, {
			userId: foundUser.id,
		});
		const refreshToken = generateJwtToken(envConfig.JWT_REFRESH_TOKEN_EXPIRATION_TIME, {
			userId: foundUser.id,
		});

		return { user: foundUser, accessToken, refreshToken };
	}

	static async signUp(
		signUpData: SignUpRequestBodyDto
	): Promise<{ newUser: User; accessToken: string; refreshToken: string }> {
		const userExists = await UsersRepository.getOneByEmail({ email: signUpData.email });

		if (userExists) {
			throw new BadRequestError("User already exists");
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(signUpData.password, salt);

		const newUser = await UsersRepository.createOne({
			username: signUpData.username,
			email: signUpData.email,
			password: hashedPassword,
		});

		const accessToken = generateJwtToken(envConfig.JWT_ACCESS_TOKEN_EXPIRATION_TIME, {
			userId: newUser.id,
		});
		const refreshToken = generateJwtToken(envConfig.JWT_REFRESH_TOKEN_EXPIRATION_TIME, {
			userId: newUser.id,
		});

		return { newUser, accessToken, refreshToken };
	}
}
