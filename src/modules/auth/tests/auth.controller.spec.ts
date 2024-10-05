import request from "supertest";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import express from "express";
import { UserModel } from "#/modules/users/users.model";

const app = express();
app.use(express.json());
app.use("/auth", AuthController);

const mockUser: UserModel = {
	id: "1",
	email: "davranbek@example.com",
	username: "davranbek",
	password: "123123123",
	role: "user",
	createdAt: new Date().toISOString(),
};

describe("AuthController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /login", () => {
		it("should login a user and set cookies and return a user", async () => {
			const mockAccessToken = "accessToken";
			const mockRefreshToken = "refreshToken";

			jest.spyOn(AuthService, "login").mockResolvedValue({
				user: mockUser,
				accessToken: mockAccessToken,
				refreshToken: mockRefreshToken,
			});

			const response = await request(app)
				.post("/auth/login")
				.send({ email: "davranbek@example.com", password: "123123123" });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: mockUser,
				message: "User logged in successfully",
			});

			const cookies = response.headers["set-cookie"];

			expect(cookies).toBeDefined();
			expect(cookies).toHaveLength(2);
			expect(cookies).toContainEqual(
				expect.stringContaining(`accessToken=${mockAccessToken}`)
			);
			expect(cookies).toContainEqual(
				expect.stringContaining(`refreshToken=${mockRefreshToken}`)
			);
		});
	});

	describe("POST /sign-up", () => {
		it("should sign up a user and set cookies and return a new user", async () => {
			const mockAccessToken = "access-token";
			const mockRefreshToken = "refresh-token";

			jest.spyOn(AuthService, "signUp").mockResolvedValue({
				newUser: mockUser,
				accessToken: mockAccessToken,
				refreshToken: mockRefreshToken,
			});

			const response = await request(app).post("/auth/sign-up").send({
				email: "davranbek@example.com",
				username: "davranbek",
				password: "123123123",
			});

			expect(response.status).toBe(201);
			expect(response.body).toEqual({
				data: mockUser,
				message: "User signed up successfully",
			});

			const cookies = response.headers["set-cookie"];

			expect(cookies).toBeDefined();
			expect(cookies).toHaveLength(2);
			expect(cookies).toContainEqual(
				expect.stringContaining(`accessToken=${mockAccessToken}`)
			);
			expect(cookies).toContainEqual(
				expect.stringContaining(`refreshToken=${mockRefreshToken}`)
			);
		});
	});
});