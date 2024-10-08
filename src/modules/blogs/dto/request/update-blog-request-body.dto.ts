import { z } from "zod";

export const updateBlogRequestBodyDtoSchema = z.object({
	authorId: z.string().uuid({ message: "authorId must be a valid UUID" }).optional(),
	title: z
		.string({ message: "title is required" })
		.max(255, { message: "title must be at most 255 characters long" })
		.optional(),
	content: z.string({ message: "content is required" }).optional(),
	tags: z.array(z.string(), { message: "tags must be an array of strings" }).optional(),
});

export type UpdateBlogRequestBodyDto = z.infer<typeof updateBlogRequestBodyDtoSchema>;
