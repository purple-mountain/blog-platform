import { z } from "zod";

export const commentsSearchParamsDtoSchema = z.object({
	page: z
		.string()
		.transform((value) => Number(value))
		.pipe(z.number().int().positive())
		.optional(),
	limit: z
		.string()
		.transform((value) => Number(value))
		.pipe(z.number().int().positive().max(1000))
		.optional(),
});

export type CommentsSearchParamsDto = z.infer<typeof commentsSearchParamsDtoSchema>;
