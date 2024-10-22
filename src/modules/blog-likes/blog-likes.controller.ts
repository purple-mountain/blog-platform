import { uuidSchema } from "#/shared/schemas/uuid.schema";
import { validatePathParameter } from "#/shared/validators/path-parameter.validator";
import { Router } from "express";
import { BlogLikesService } from "./blog-likes.service";
import { auth } from "#/shared/middlewares/auth.middleware";

export const BlogLikesController = Router();

BlogLikesController.get(
	"/:blogId/likes",
	validatePathParameter("blogId", uuidSchema),

	async (req, res) => {
		const likes = await BlogLikesService.getBlogLikesCount(req.params["blogId"] || "");

		return res
			.status(200)
			.json({ data: likes, message: "Like count retrieved successfully" });
	}
);

BlogLikesController.post(
	"/:blogId/likes",
	auth,
	validatePathParameter("blogId", uuidSchema),

	async (req, res) => {
		const like = await BlogLikesService.likeBlog(req.params["blogId"] || "", req.user.id);

		return res
			.status(200)
			.json({ data: like, message: "Blog has been liked successfully" });
	}
);

BlogLikesController.delete(
	"/:blogId/likes",
	auth,
	validatePathParameter("blogId", uuidSchema),

	async (req, res) => {
		await BlogLikesService.unlikeBlog(req.params["blogId"] || "", req.user.id);

		return res.status(204).send();
	}
);
