import { BlogsRepository } from "../blogs/blogs.repository";
import { BlogLikesRepository } from "./blog-likes.repository";
import { BlogLike } from "./entities/blog-like.entity";

export class BlogLikesService {
	static async getBlogLikesCount(blogId: string): Promise<number> {
		const blogExists = await BlogsRepository.getOne({ id: blogId });

		if (!blogExists) {
			throw new Error("Blog not found");
		}

		return await BlogLikesRepository.count(blogId);
	}

	static async likeBlog(blogId: string, userId: string): Promise<BlogLike> {
		const blogIsAlreadyLiked = await BlogLikesRepository.getOne(blogId, userId);

		if (blogIsAlreadyLiked) {
			throw new Error("User has already liked this blog");
		}

		return await BlogLikesRepository.create(blogId, userId);
	}

	static async unlikeBlog(blogId: string, userId: string): Promise<void> {
		const { affected } = await BlogLikesRepository.delete(blogId, userId);

		if (affected === 0) {
			throw new Error("User has not liked this blog");
		}
	}
}
