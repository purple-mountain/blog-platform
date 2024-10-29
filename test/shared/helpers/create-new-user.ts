import request from "supertest";
import Express from "express";
import { faker } from "@faker-js/faker";
import { SignUpRequestBodyDto } from "../../../src/modules/auth/dto/request/sign-up-request-body.dto";
import { User } from "../../../src/modules/users/entities/user.entity";
import { AuthData } from "../types/auth-data.type";

type TestUser = {
	user: User;
	password: string;
	authData: AuthData;
};

export async function createTestUser(app: Express.Application): Promise<TestUser> {
	const signUpData: SignUpRequestBodyDto = {
		email: faker.internet.email(),
		username: faker.internet.userName(),
		password: faker.internet.password(),
	};

	const response = await request(app).post("/auth/sign-up").send(signUpData);

	const cookies = response.headers["set-cookie"] as unknown as string[];

	return {
		user: response.body.data,
		authData: {
			accessToken: cookies[0] as string,
			refreshToken: cookies[1] as string,
		},
		password: signUpData.password,
	};
}
