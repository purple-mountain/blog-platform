import request from "supertest";
import express from "express";
import { SeederOptions } from "typeorm-extension";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { UsersFactory } from "../../src/database/factories/users.factory";
import { UsersSeeder } from "../../src/database/seeders/users.seeder";
import cookieParser from "cookie-parser";
import { SignUpRequestBodyDto } from "../../src/modules/auth/dto/request/sign-up-request-body.dto";
import { User } from "../../src/modules/users/entities/user.entity";
import { UsersRepository } from "../../src/modules/users/users.repository";
import { LoginRequestBodyDto } from "../../src/modules/auth/dto/request/login-request-body.dto";
import { errorMiddleware } from "../../src/shared/middlewares/error.middleware";
import { TestDatabase } from "../database/test-database";
import { createTestUser } from "../shared/helpers/create-new-user";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", AuthController);

app.use(errorMiddleware);

describe("Auth", () => {
	let testDatabase: TestDatabase;

	beforeAll(async () => {
		const options: SeederOptions = {
			factories: [UsersFactory],
			seeds: [UsersSeeder],
		};

		testDatabase = new TestDatabase(options);

		await testDatabase.start();

		testDatabase.setupRepositories([
			{
				repository: UsersRepository,
				entity: User,
			},
		]);
	}, 60000);

	afterAll(async () => {
		await testDatabase.stop();
	});

	describe("POST /auth/sign-up", () => {
		const signUpData: SignUpRequestBodyDto = {
			username: "joebiden",
			password: "joebidenjoebiden123123",
			email: "joebiden@gmail.com",
		};

		it("should sign up a user and set cookies and return a new user", async () => {
			const response = await request(app).post("/auth/sign-up").send(signUpData);

			expect(response.status).toBe(200);

			const newUser = await UsersRepository.getOneByEmail({ email: signUpData.email });

			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(newUser)),
				message: "User signed up successfully",
			});

			const cookies = response.headers["set-cookie"];

			expect(cookies).toBeDefined();
			expect(cookies).toHaveLength(2);
		});
	});

	describe("POST /auth/login", () => {
		let newUser: User;
		let loginData: LoginRequestBodyDto;

		beforeAll(async () => {
			const testUser = await createTestUser(app);

			newUser = testUser.user;

			loginData = {
				email: newUser.email,
				password: testUser.password,
			};
		});

		it("should login a user and set cookies and return a user", async () => {
			const response = await request(app).post("/auth/login").send(loginData);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: newUser,
				message: "User logged in successfully",
			});

			const cookies = response.headers["set-cookie"];

			expect(cookies).toBeDefined();
			expect(cookies).toHaveLength(2);
		});

		it("should return 401 if password is incorrect", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({ ...loginData, password: "wrongPassword" });

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "Password is incorrect",
			});

			const cookies = response.headers["set-cookie"];

			expect(cookies).toBeUndefined();
		});
	});
});
