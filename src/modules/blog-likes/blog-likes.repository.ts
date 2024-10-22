import { AppDataSource } from "#/database/database";
import { DeleteResult, Repository } from "typeorm";
import { BlogLike } from "./entities/blog-like.entity";

export class BlogLikesRepository {
	private static blogLikesRepository: Repository<BlogLike> =
		AppDataSource.getRepository(BlogLike);

	static async getOne(userId: string, blogId: string): Promise<BlogLike | null> {
		return await this.blogLikesRepository.findOne({
			where: { user: { id: userId }, blog: { id: blogId } },
		});
	}

	static async count(blogId: string): Promise<number> {
		return await this.blogLikesRepository.countBy({ blog: { id: blogId } });
	}

	static async create(userId: string, blogId: string): Promise<BlogLike> {
		const newBlogLike = this.blogLikesRepository.create({
			user: { id: userId },
			blog: { id: blogId },
		});

		await this.blogLikesRepository.save(newBlogLike);

		return newBlogLike;
	}

	static async delete(userId: string, blogId: string): Promise<DeleteResult> {
		return await this.blogLikesRepository.delete({
			user: { id: userId },
			blog: { id: blogId },
		});
	}
}
