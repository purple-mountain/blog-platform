import { DeleteResult, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { AppDataSource } from "#/database/database";
import { UpdateCommentRequestBodyDto } from "./dto/request/update-comment-request-body.dto";
import { BlogsSearchParamsDto } from "../blogs/dto/request/blog-search-params.dto";
import { CreateCommentRequestBodyDto } from "./dto/request/create-comment-request-body.dto";

export class CommentsRepository {
	private static commentsRepository: Repository<Comment> =
		AppDataSource.getRepository(Comment);

	static async getAllByBlogId(
		searchParams: BlogsSearchParamsDto,
		blogId: string
	): Promise<Comment[] | null> {
		const limit = searchParams.limit || 10;
		const page = searchParams.page || 1;

		const comments = await this.commentsRepository.find({
			where: { blog: { id: blogId } },
			take: limit,
			skip: (page - 1) * limit,
		});

		if (!comments) {
			return null;
		}

		return comments;
	}

	static async updateOne(data: UpdateCommentRequestBodyDto, commentId: string) {
		const comment = await this.commentsRepository.findOne({
			where: { id: commentId },
			relations: ["user", "blog"],
			select: {
				user: {
					id: true,
					username: true,
					email: true,
				},
				blog: {
					id: true,
				},
			},
		});

		if (!comment) {
			return null;
		}

		const updatedComment = await this.commentsRepository.save({ ...comment, ...data });

		return updatedComment;
	}

	static async deleteOne({ id }: { id: string }): Promise<DeleteResult> {
		return await this.commentsRepository.delete(id);
	}

	static async createOne(
		data: CreateCommentRequestBodyDto,
		authorId: string,
		blogId: string
	): Promise<Comment> {
		const newComment = this.commentsRepository.create({
			...data,
			user: { id: authorId },
			blog: { id: blogId },
		});

		await this.commentsRepository.save(newComment);

		return newComment;
	}
}
