import { z } from "zod";

export const createCommentRequestBodyDtoSchema = z
	.object({
		content: z
			.string({ message: "content is required" })
			.min(1, { message: "content can't be empty" }),
	})
	.strict({ message: "Unknown fields found in request body" });

export type CreateCommentRequestBodyDto = z.infer<
	typeof createCommentRequestBodyDtoSchema
>;
