import { z } from "zod";

export const signUpRequestBodyDtoSchema = z
	.object({
		username: z
			.string({ message: "Username is required" })
			.min(1, { message: "Username cannot be empty" })
			.max(1000, { message: "Username max length is 255" }),
		email: z
			.string({ message: "Email is required" })
			.min(3, { message: "Email is invalid" })
			.max(255, { message: "Email max length is 255" })
			.email({ message: "Email is invalid" }),
		password: z
			.string({ message: "Password is required" })
			.min(8, { message: "Password must be more than 8 characters long" }),
	})
	.strict({ message: "Invalid body" });

export type SignUpRequestBodyDto = z.infer<typeof signUpRequestBodyDtoSchema>;
