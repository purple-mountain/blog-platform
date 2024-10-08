import { z } from "zod";

export const blogsSearchParamsDtoSchema = z.object({
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

export type BlogsSearchParamsDto = z.infer<typeof blogsSearchParamsDtoSchema>;
