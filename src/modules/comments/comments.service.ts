import { UpdateCommentRequestBodyDto } from "./dto/request/update-comment-request-body.dto";
import { CommentsRepository } from "./comments.repository";
import { NotFoundError } from "#/shared/errors/not-found-error";
import { Comment } from "./entities/comment.entity";

export class CommentsService {
	static async updateComment(
		data: UpdateCommentRequestBodyDto,
		commentId: string
	): Promise<Comment> {
		const updatedComment = await CommentsRepository.updateOne(data, commentId);

		if (!updatedComment) {
			throw new NotFoundError("Comment not found");
		}

		return updatedComment;
	}

	static async deleteComment(commentId: string) {
		const { affected } = await CommentsRepository.deleteOne({ id: commentId });

		if (!affected) {
			throw new NotFoundError("Comment not found");
		}
	}
}
