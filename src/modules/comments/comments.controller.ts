import "express-async-errors";
import { Request, Response, Router } from "express";
import { CommentsService } from "./comments.service";
import { Comment } from "./entities/comment.entity";
import { checkResourceOwnership } from "#/shared/middlewares/check-resource-ownership.middleware";
import { validatePathParameter } from "#/shared/validators/path-parameter.validator";
import { uuidSchema } from "#/shared/schemas/uuid.schema";
import { auth } from "#/shared/middlewares/auth.middleware";
import { validateRequestBody } from "#/shared/validators/request-body.validator";
import { updateCommentRequestBodyDtoSchema } from "./dto/request/update-comment-request-body.dto";
import { validateSearchParams } from "#/shared/validators/search-params.validator";
import {
	CommentsSearchParamsDto,
	commentsSearchParamsDtoSchema,
} from "./dto/request/comment-search-params.dto";
import { createCommentRequestBodyDtoSchema } from "./dto/request/create-comment-request-body.dto";

export const CommentsController = Router();

CommentsController.get(
	"/blogs/:id/comments",
	validatePathParameter("id", uuidSchema),
	validateSearchParams(commentsSearchParamsDtoSchema),

	async (req, res) => {
		const searchParams = req.query as unknown as CommentsSearchParamsDto;
		const blog = await CommentsService.getBlogComments(
			searchParams,
			req.params["id"] || ""
		);

		return res
			.status(200)
			.json({ data: blog, message: "Blog comments retrieved successfully" });
	}
);

CommentsController.post(
	"/blogs/:id/comments",
	auth,
	validatePathParameter("id", uuidSchema),
	validateRequestBody(createCommentRequestBodyDtoSchema),

	async (req, res) => {
		const newComment = await CommentsService.createBlogComment(
			req.body,
			req.user.id,
			req.params["id"] || ""
		);

		return res
			.status(200)
			.json({ data: newComment, message: "Blog comment created successfully" });
	}
);

CommentsController.put(
	"/comments/:id",
	auth,
	validatePathParameter("id", uuidSchema),
	validateRequestBody(updateCommentRequestBodyDtoSchema),
	checkResourceOwnership(Comment, { allowAdmin: false }),

	async (req: Request, res: Response) => {
		const updatedComment = await CommentsService.updateComment(
			req.body,
			req.params["id"] || ""
		);

		return res
			.status(200)
			.json({ data: updatedComment, message: "Comment updated successfully" });
	}
);

CommentsController.delete(
	"/comments/:id",
	auth,
	validatePathParameter("id", uuidSchema),
	checkResourceOwnership(Comment, { allowAdmin: true }),

	async (req: Request, res: Response) => {
		await CommentsService.deleteComment(req.params["id"] || "");

		return res.status(204).send();
	}
);
