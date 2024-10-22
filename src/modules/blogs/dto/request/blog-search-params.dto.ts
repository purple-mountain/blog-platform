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
	title: z
		.string()
		.max(255, { message: "title must be at most 255 characters long" })
		.optional(),
	content: z.string().optional(),
	tags: z
		.string()
		.transform((value) => value.split(",").map((tag) => tag.trim().toLowerCase()))
		.pipe(z.array(z.string()))
		.optional(),
});

export type BlogsSearchParamsDto = z.infer<typeof blogsSearchParamsDtoSchema>;
