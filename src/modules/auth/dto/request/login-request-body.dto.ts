import { z } from "zod";

export const loginRequestBodyDtoSchema = z
	.object({
		email: z
			.string({ message: "Email is required" })
			.min(3, { message: "Email is invalid" })
			.max(255, { message: "Email max length is 255" })
			.email({ message: "Email is invalid" }),
		password: z
			.string({ message: "Password is required" })
			.min(8, { message: "Password must be more than 8 characters long" }),
	})
	.strict({ message: "Unknown fields found in request body" });

export type LoginRequestBodyDto = z.infer<typeof loginRequestBodyDtoSchema>;
