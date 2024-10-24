import { z } from "zod";

export const updateUserProfileRequestBodyDtoSchema = z.object({
	email: z.string().email().optional(),
	username: z.string().min(1, { message: "Username can't be empty" }).max(255).optional(),
});

export type UpdateUserProfileRequestBodyDto = z.infer<
	typeof updateUserProfileRequestBodyDtoSchema
>;
