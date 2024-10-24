import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { UsersController } from "../users.controller";
import { UsersService } from "../users.service";
import { UserRole } from "#/shared/constants/user-role.constant";
import { User } from "../entities/user.entity";
import { UpdateUserProfileRequestBodyDto } from "../dto/request/update-user-profile-request-body.dto";
import { UpdateUserPasswordRequestBodyDto } from "../dto/request/update-user-password-request-body.dto";

const app = express();

app.use(express.json());

app.use("/users", UsersController);

jest.mock("../users.service");

jest.mock("#/shared/middlewares/auth.middleware", () => ({
	auth: (req: Request, _res: Response, next: NextFunction) => {
		req.user = { id: "1", role: "user" };
		next();
	},
}));

jest.mock("#/shared/middlewares/require-role.middleware", () => ({
	requireRole: () => (req: Request, _res: Response, next: NextFunction) => {
		next();
	},
}));

jest.mock("#/shared/validators/path-parameter.validator", () => ({
	validatePathParameter: () => (_req: Request, _res: Response, next: NextFunction) =>
		next(),
}));

jest.mock("#/shared/validators/request-body.validator", () => ({
	validateRequestBody: () => (_req: Request, _res: Response, next: NextFunction) => {
		next();
	},
}));

const mockUser: User = {
	id: "1",
	email: "davranbek@example.com",
	username: "davranbek",
	password: "123123123",
	role: UserRole.USER,
	createdAt: new Date(),
};

describe("UsersController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /users/profile", () => {
		it("should return user profile", async () => {
			(UsersService.getProfile as jest.Mock).mockResolvedValue(mockUser);

			const response = await request(app).get("/users/profile");

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				...mockUser,
				createdAt: mockUser.createdAt.toISOString(),
			});
			expect(response.body.message).toBe("User profile retrieved successfully");
		});
	});

	describe("PUT /users/profile", () => {
		const updateData: UpdateUserProfileRequestBodyDto = {
			email: mockUser.email,
			username: mockUser.username,
		};

		it("should update user profile", async () => {
			const updateProfileSpy = jest
				.spyOn(UsersService, "updateProfile")
				.mockResolvedValue(mockUser);

			const response = await request(app).put("/users/profile").send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				...mockUser,
				createdAt: mockUser.createdAt.toISOString(),
			});

			expect(updateProfileSpy).toHaveBeenCalledTimes(1);
			expect(updateProfileSpy).toHaveBeenCalledWith(updateData, "1");
		});
	});

	describe("PUT /users/profile/password", () => {
		const updatePasswordData: UpdateUserPasswordRequestBodyDto = {
			currentPassword: "123123123",
			newPassword: "newpassword",
		};

		it("should update user password", async () => {
			const updatePasswordSpy = jest
				.spyOn(UsersService, "updatePassword")
				.mockResolvedValue(undefined);

			const response = await request(app)
				.put("/users/profile/password")
				.send(updatePasswordData);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe("User password updated successfully");

			expect(updatePasswordSpy).toHaveBeenCalledTimes(1);
			expect(updatePasswordSpy).toHaveBeenCalledWith(updatePasswordData, "1");
		});
	});

	describe("PUT /users/:id/role", () => {
		it("should update user role", async () => {
			(UsersService.updateUserRole as jest.Mock).mockResolvedValue(mockUser);

			const response = await request(app)
				.put("/users/" + 1 + "/role")
				.send({
					role: "admin",
				});

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				...mockUser,
				createdAt: mockUser.createdAt.toISOString(),
			});
			expect(response.body.message).toBe("User role updated successfully");
		});
	});
});
