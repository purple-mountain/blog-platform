import { z } from "zod";

export const updateUserPasswordRequestBodyDtoSchema = z
	.object({
		currentPassword: z.string({ message: "currentPassword is required" }),
		newPassword: z
			.string({ message: "newPassword is required" })
			.min(8, { message: "Password must be more than 8 characters long" }),
	})
	.strict({ message: "Unknown fields found in request body" });

export type UpdateUserPasswordRequestBodyDto = z.infer<
	typeof updateUserPasswordRequestBodyDtoSchema
>;
