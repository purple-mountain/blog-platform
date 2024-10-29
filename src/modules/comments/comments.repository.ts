import { DeleteResult, Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { UpdateCommentRequestBodyDto } from "./dto/request/update-comment-request-body.dto";
import { BlogsSearchParamsDto } from "../blogs/dto/request/blog-search-params.dto";
import { CreateCommentRequestBodyDto } from "./dto/request/create-comment-request-body.dto";
import { db } from "#/database/database";

export class CommentsRepository {
	private static commentsRepository: Repository<Comment> = db
		.getDataSource()
		.getRepository(Comment);

	static async getOne({ id }: { id: string }): Promise<Comment | null> {
		return await this.commentsRepository.findOne({
			where: { id },
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
	}

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
		const commentToUpdate = await this.getOne({ id: commentId });

		if (!commentToUpdate) {
			return null;
		}

		const updatedComment = await this.commentsRepository.save({
			...commentToUpdate,
			...data,
		});

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
		const commentToSave = this.commentsRepository.create({
			...data,
			user: { id: authorId },
			blog: { id: blogId },
		});

		const createdComment = await this.commentsRepository.save(commentToSave);

		const fetchedComment = await this.getOne({ id: createdComment.id });

		if (!fetchedComment) {
			throw new Error("Database error");
		}

		return fetchedComment;
	}

	static setRepository(repository: Repository<Comment>) {
		this.commentsRepository = repository;
	}
}
