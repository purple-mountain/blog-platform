import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { AuthData } from "../shared/types/auth-data.type";
import { SeederOptions } from "typeorm-extension";
import { UsersFactory } from "../../src/database/factories/users.factory";
import { TestDatabase } from "../database/test-database";
import { UsersRepository } from "../../src/modules/users/users.repository";
import { User } from "../../src/modules/users/entities/user.entity";
import { createTestUser } from "../shared/helpers/create-new-user";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { UsersController } from "../../src/modules/users/users.controller";
import { errorMiddleware } from "../../src/shared/middlewares/error.middleware";
import { UsersSeeder } from "../../src/database/seeders/users.seeder";
import { UserRole } from "../../src/shared/constants/user-role.constant";
import { db } from "../../src/database/database";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", AuthController);
app.use("/users", UsersController);

app.use(errorMiddleware);

describe("User Management", () => {
	let user: {
		authData: AuthData;
		data: User;
		password: string;
	};
	let admin: {
		authData: AuthData;
		data: User;
	};
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

		const testUserPayload = await createTestUser(app);

		user = {
			authData: testUserPayload.authData,
			data: testUserPayload.user,
			password: testUserPayload.password,
		};

		const testAdminPayload = await createTestUser(app);

		await db
			.getDataSource()
			.getRepository(User)
			.update(testAdminPayload.user.id, { role: UserRole.ADMIN });

		admin = {
			authData: testAdminPayload.authData,
			data: { ...testAdminPayload.user, role: UserRole.ADMIN },
		};
	}, 60000);

	afterAll(async () => {
		await testDatabase.stop();
	});

	describe("GET /profile", () => {
		it("should get user profile", async () => {
			const response = await request(app)
				.get("/users/profile")
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual(user.data);
		});
	});

	describe("PUT /profile", () => {
		it("should update user profile", async () => {
			const response = await request(app)
				.put("/users/profile")
				.send({ username: "new username" })
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: { ...user.data, username: "new username" },
				message: "User profile updated successfully",
			});
		});
	});

	describe("PUT /profile/password", () => {
		it("should update user password", async () => {
			const response = await request(app)
				.put("/users/profile/password")
				.send({ currentPassword: user.password, newPassword: "newPassword" })
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				message: "User password updated successfully",
			});
		});

		it("should not update user password if the current password is incorrect", async () => {
			const response = await request(app)
				.put("/users/profile/password")
				.send({ currentPassword: "wrongPassword", newPassword: "newPassword" })
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "Password is incorrect",
			});
		});
	});

	describe("/:userId/role", () => {
		let user: {
			authData: AuthData;
			data: User;
		};

		beforeAll(async () => {
			const testUserPayload = await createTestUser(app);

			user = {
				authData: testUserPayload.authData,
				data: testUserPayload.user,
			};
		});

		it("should not update user role if the user is not an admin", async () => {
			const response = await request(app)
				.put(`/users/${user.data.id}/role`)
				.send({ role: UserRole.ADMIN })
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "You do not have the required role to access this resource",
			});
		});

		it("should update user role to admin", async () => {
			const response = await request(app)
				.put(`/users/${user.data.id}/role`)
				.send({ role: UserRole.ADMIN })
				.set("Cookie", [admin.authData.accessToken, admin.authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: { ...user.data, role: UserRole.ADMIN },
				message: "User role updated successfully",
			});
		});

		it("should update user role to user", async () => {
			const response = await request(app)
				.put(`/users/${user.data.id}/role`)
				.send({ role: UserRole.USER })
				.set("Cookie", [admin.authData.accessToken, admin.authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: { ...user.data, role: UserRole.USER },
				message: "User role updated successfully",
			});
		});
	});
});
