import { z } from "zod";

export const updateCommentRequestBodyDtoSchema = z.object({
	content: z.string({ message: "content is required" }).optional(),
});

export type UpdateCommentRequestBodyDto = z.infer<
	typeof updateCommentRequestBodyDtoSchema
>;
