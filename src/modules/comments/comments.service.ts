import { UpdateCommentRequestBodyDto } from "./dto/request/update-comment-request-body.dto";
import { CommentsRepository } from "./comments.repository";
import { NotFoundError } from "#/shared/errors/not-found.error";
import { Comment } from "./entities/comment.entity";
import { CommentsSearchParamsDto } from "./dto/request/comment-search-params.dto";
import { CreateCommentRequestBodyDto } from "./dto/request/create-comment-request-body.dto";
import { BlogsRepository } from "../blogs/blogs.repository";

export class CommentsService {
	static async getBlogComments(
		searchParams: CommentsSearchParamsDto,
		blogId: string
	): Promise<Comment[]> {
		const comments = await CommentsRepository.getAllByBlogId(searchParams, blogId);

		if (!comments) {
			throw new NotFoundError("Blog not found");
		}

		return comments;
	}

	static async createBlogComment(
		data: CreateCommentRequestBodyDto,
		authorId: string,
		blogId: string
	): Promise<Comment> {
		const blogExists = await BlogsRepository.getOne({ id: blogId });

		if (!blogExists) {
			throw new NotFoundError("Blog not found");
		}

		const newBlogComment = await CommentsRepository.createOne(data, authorId, blogId);

		return newBlogComment;
	}

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

	static async deleteComment(commentId: string): Promise<void> {
		const { affected } = await CommentsRepository.deleteOne({ id: commentId });

		if (!affected) {
			throw new NotFoundError("Comment not found");
		}
	}
}
