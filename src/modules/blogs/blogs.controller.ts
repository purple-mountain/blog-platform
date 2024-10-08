import { validateRequestBody } from "#/shared/validators/request-body.validator";
import { Router } from "express";
import { BlogsService } from "./blogs.service";
import "express-async-errors";
import { createBlogRequestBodyDtoSchema } from "./dto/request/create-blog-request-body.dto";
import { updateBlogRequestBodyDtoSchema } from "./dto/request/update-blog-request-body.dto";
import { validatePathParameter } from "#/shared/validators/path-parameter.validator";
import { uuidSchema } from "#/shared/schemas/uuid-schema";
import { auth } from "#/shared/middlewares/auth.middleware";
import { checkResourceOwnership } from "#/shared/middlewares/checkResourceOwnership.middleware";
import { Blog } from "./entities/blog.entity";
import { AppDataSource } from "#/database/database";
import { validateSearchParams } from "#/shared/validators/search-params.validator";
import {
	BlogsSearchParamsDto,
	blogsSearchParamsDtoSchema,
} from "./dto/request/blog-search-params.dto";

export const BlogsController = Router();

BlogsController.get(
	"/",
	validateSearchParams(blogsSearchParamsDtoSchema),
	async (req, res) => {
		const searchParams = req.query as unknown as BlogsSearchParamsDto;
		const blogs = await BlogsService.getBlogs(searchParams);

		return res.status(200).json({ data: blogs, message: "Blogs retrieved successfully" });
	}
);

BlogsController.get("/:id", validatePathParameter("id", uuidSchema), async (req, res) => {
	const blog = await BlogsService.getBlog(req.params["id"] || "");

	return res.status(200).json({ data: blog, message: "Blog retrieved successfully" });
});

BlogsController.post(
	"/",
	auth,
	validateRequestBody(createBlogRequestBodyDtoSchema),
	async (req, res) => {
		const newBlog = await BlogsService.createBlog(req.body, req.user.id);

		return res.status(201).json({ data: newBlog, message: "Blog created successfully" });
	}
);

BlogsController.put(
	"/:id",
	auth,
	validatePathParameter("id", uuidSchema),
	validateRequestBody(updateBlogRequestBodyDtoSchema),
	checkResourceOwnership(Blog, AppDataSource, false),
	async (req, res) => {
		const updatedBlog = await BlogsService.updateBlog(req.body, req.params["id"] || "");

		return res
			.status(200)
			.json({ data: updatedBlog, message: "Blog updated successfully" });
	}
);

BlogsController.delete(
	"/:id",
	auth,
	validatePathParameter("id", uuidSchema),
	checkResourceOwnership(Blog, AppDataSource, true),
	async (req, res) => {
		await BlogsService.deleteBlog(req.params["id"] || "");

		return res.status(204).send();
	}
);
