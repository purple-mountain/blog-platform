import { z } from "zod";

export const createBlogRequestBodyDtoSchema = z
	.object({
		title: z
			.string({ message: "title is required" })
			.max(255, { message: "title must be at most 255 characters long" }),
		content: z.string({ message: "content is required" }),
		tags: z.array(z.string(), { message: "tags must be an array of strings" }),
	})
	.strict({ message: "Unknown fields found in request body" });

export type CreateBlogRequestBodyDto = z.infer<typeof createBlogRequestBodyDtoSchema>;
