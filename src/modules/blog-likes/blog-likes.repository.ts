import { DeleteResult, Repository } from "typeorm";
import { BlogLike } from "./entities/blog-like.entity";
import { redisClient } from "#/redis/redis-client";
import { db } from "#/database/database";
import { RedisClient } from "#/redis/redis-client";

export class BlogLikesRepository {
	private static blogLikesRepository: Repository<BlogLike> = db
		.getDataSource()
		.getRepository(BlogLike);
	private static blogLikesCache: RedisClient = redisClient;

	static async getOne(blogId: string, userId: string): Promise<BlogLike | null> {
		return await this.blogLikesRepository.findOne({
			where: { user: { id: userId }, blog: { id: blogId } },
		});
	}

	static async count(blogId: string): Promise<number> {
		const cachedLikeCount = await this.blogLikesCache.get(`blog:${blogId}:likes`);

		if (cachedLikeCount) {
			const parsedCachedLikeCount = parseInt(cachedLikeCount);

			if (isNaN(parsedCachedLikeCount)) {
				await this.blogLikesCache.del(`blog:${blogId}:likes`);
				throw new Error("Redis Error: Could not parse cached like count");
			}

			return parsedCachedLikeCount;
		}

		const likeCount = await this.blogLikesRepository.countBy({ blog: { id: blogId } });
		await this.blogLikesCache.set(`blog:${blogId}:likes`, likeCount, 60 * 60 * 24);

		return likeCount;
	}

	static async create(blogId: string, userId: string): Promise<BlogLike> {
		const newBlogLike = this.blogLikesRepository.create({
			user: { id: userId },
			blog: { id: blogId },
		});

		await this.blogLikesRepository.save(newBlogLike);

		const blogLikesCacheExists = await this.blogLikesCache.exists(`blog:${blogId}:likes`);

		if (blogLikesCacheExists) {
			await this.blogLikesCache.incr(`blog:${blogId}:likes`);
		}

		return newBlogLike;
	}

	static async delete(blogId: string, userId: string): Promise<DeleteResult> {
		const deleteResult = await this.blogLikesRepository.delete({
			user: { id: userId },
			blog: { id: blogId },
		});

		const blogLikeExists = deleteResult.affected === 1;

		if (blogLikeExists) {
			const blogLikesCacheExists = await this.blogLikesCache.exists(
				`blog:${blogId}:likes`
			);

			if (blogLikesCacheExists) {
				await this.blogLikesCache.decr(`blog:${blogId}:likes`);
			}
		}

		return deleteResult;
	}

	static setRepository(repository: Repository<BlogLike>) {
		this.blogLikesRepository = repository;
	}

	static setCache(cache: RedisClient) {
		this.blogLikesCache = cache;
	}
}
