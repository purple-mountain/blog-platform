import "express-async-errors";
import { Request, Response, Router } from "express";
import { CommentsService } from "./comments.service";
import { Comment } from "./entities/comment.entity";
import { checkResourceOwnership } from "#/shared/middlewares/checkResourceOwnership.middleware";
import { validatePathParameter } from "#/shared/validators/path-parameter.validator";
import { uuidSchema } from "#/shared/schemas/uuid-schema";
import { auth } from "#/shared/middlewares/auth.middleware";
import { validateRequestBody } from "#/shared/validators/request-body.validator";
import { updateCommentRequestBodyDtoSchema } from "./dto/request/update-comment-request-body.dto";

export const CommentsController = Router();

CommentsController.put(
	"/:id",
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
			.json({ data: updatedComment, message: "Comment updated sucessfully" });
	}
);

CommentsController.delete(
	"/:id",
	auth,
	validatePathParameter("id", uuidSchema),
	checkResourceOwnership(Comment, { allowAdmin: true }),
	async (req: Request, res: Response) => {
		await CommentsService.deleteComment(req.params["id"] || "");

		return res.status(204).send();
	}
);
