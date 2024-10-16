import { UserRole } from "#/shared/constants/user-role.constant";
import { z } from "zod";

export const updateUserRoleRequestBodyDtoSchema = z.object({
	role: z.enum([UserRole.USER, UserRole.ADMIN], {
		message: `Role must be one of the following: ${Object.values(UserRole).join(", ")}`,
	}),
});

export type UpdateUserRoleRequestBodyDto = z.infer<
	typeof updateUserRoleRequestBodyDtoSchema
>;
