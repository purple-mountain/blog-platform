import "express-async-errors";
import { Request, Response } from "express";
import { Router } from "express";
import { UsersService } from "./users.service";
import { validateRequestBody } from "#/shared/validators/request-body.validator";
import { updateUserRoleRequestBodyDtoSchema } from "./dto/request/update-user-role-request-body.dto";
import { validatePathParameter } from "#/shared/validators/path-parameter.validator";
import { uuidSchema } from "#/shared/schemas/uuid.schema";
import { auth } from "#/shared/middlewares/auth.middleware";
import { requireRole } from "#/shared/middlewares/require-role.middleware";
import { UserRole } from "#/shared/constants/user-role.constant";
import { updateUserProfileRequestBodyDtoSchema } from "./dto/request/update-user-profile-request-body.dto";
import { updateUserPasswordRequestBodyDtoSchema } from "./dto/request/update-user-password-request-body.dto";

export const UsersController = Router();

UsersController.get(
	"/profile",
	auth,

	async (req: Request, res: Response) => {
		const user = await UsersService.getProfile(req.user.id);

		return res.status(200).json({
			data: user,
			message: "User profile retrieved successfully",
		});
	}
);

UsersController.put(
	"/profile",
	auth,
	validateRequestBody(updateUserProfileRequestBodyDtoSchema),

	async (req: Request, res: Response) => {
		const updatedUser = await UsersService.updateProfile(req.body, req.user.id);

		return res.status(200).json({
			data: updatedUser,
			message: "User profile updated successfully",
		});
	}
);

UsersController.put(
	"/profile/password",
	auth,
	validateRequestBody(updateUserPasswordRequestBodyDtoSchema),

	async (req: Request, res: Response) => {
		await UsersService.updatePassword(req.body, req.user.id);

		return res.status(200).json({
			message: "User password updated successfully",
		});
	}
);

UsersController.put(
	"/:userId/role",
	auth,
	requireRole(UserRole.ADMIN),
	validatePathParameter("userId", uuidSchema),
	validateRequestBody(updateUserRoleRequestBodyDtoSchema),

	async (req: Request, res: Response) => {
		const updatedUser = await UsersService.updateUserRole(
			req.body,
			req.params["userId"] || ""
		);

		return res.status(200).json({
			data: updatedUser,
			message: "User role updated successfully",
		});
	}
);
