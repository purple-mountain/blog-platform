import { BlogsRepository } from "#/modules/blogs/blogs.repository";
import { Blog } from "#/modules/blogs/entities/blog.entity";
import { randomUUID } from "crypto";
import { BlogLikesRepository } from "../blog-likes.repository";
import { BlogLikesService } from "../blog-likes.service";
import { NotFoundError } from "#/shared/errors/not-found.error";
import { BlogLike } from "../entities/blog-like.entity";
import { BadRequestError } from "#/shared/errors/bad-request.error";

const mockBlogLike: BlogLike = {
	id: "1",
	user: {
		id: "1",
	},
	blog: {
		id: "1",
	},
	likedAt: new Date(),
};

const mockBlog: Blog = {
	id: randomUUID(),
	author: { id: "1", email: "davranbek@example.com", username: "davranbek" },
	title: "Blog 1",
	content: "Content 1",
	tags: ["tag1"],
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockBlogLikesCount = 20;

describe("BlogLikesService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getBlogLikesCount", () => {
		it("should get likes count", async () => {
			const blogsRepositorySpy = jest
				.spyOn(BlogsRepository, "getOne")
				.mockResolvedValue(mockBlog);
			const blogLikesRepositorySpy = jest
				.spyOn(BlogLikesRepository, "count")
				.mockResolvedValue(mockBlogLikesCount);

			await expect(BlogLikesService.getBlogLikesCount(mockBlog.id)).resolves.toBe(
				mockBlogLikesCount
			);

			expect(blogsRepositorySpy).toHaveBeenCalledTimes(1);
			expect(blogsRepositorySpy).toHaveBeenLastCalledWith({ id: mockBlog.id });

			expect(blogLikesRepositorySpy).toHaveBeenCalledTimes(1);
			expect(blogLikesRepositorySpy).toHaveBeenLastCalledWith(mockBlog.id);
		});

		it("should throw an error if blog not found", async () => {
			const blogsRepositorySpy = jest
				.spyOn(BlogsRepository, "getOne")
				.mockResolvedValue(null);
			const blogLikesRepositorySpy = jest
				.spyOn(BlogLikesRepository, "count")
				.mockResolvedValue(mockBlogLikesCount);

			await expect(BlogLikesService.getBlogLikesCount(mockBlog.id)).rejects.toThrow(
				NotFoundError
			);

			expect(blogsRepositorySpy).toHaveBeenCalledTimes(1);
			expect(blogsRepositorySpy).toHaveBeenLastCalledWith({ id: mockBlog.id });

			expect(blogLikesRepositorySpy).toHaveBeenCalledTimes(0);
		});
	});

	describe("likeBlog", () => {
		it("should like a blog and return like info", async () => {
			const blogLikesRepositoryGetOneSpy = jest
				.spyOn(BlogLikesRepository, "getOne")
				.mockResolvedValue(null);
			const blogLikesRepositoryCreateSpy = jest
				.spyOn(BlogLikesRepository, "create")
				.mockResolvedValue(mockBlogLike);

			await expect(
				BlogLikesService.likeBlog(mockBlogLike.blog.id, mockBlogLike.user.id)
			).resolves.toEqual(mockBlogLike);

			expect(blogLikesRepositoryGetOneSpy).toHaveBeenCalledTimes(1);
			expect(blogLikesRepositoryGetOneSpy).toHaveBeenLastCalledWith(
				mockBlogLike.blog.id,
				mockBlogLike.user.id
			);

			expect(blogLikesRepositoryCreateSpy).toHaveBeenCalledTimes(1);
			expect(blogLikesRepositoryCreateSpy).toHaveBeenLastCalledWith(
				mockBlogLike.blog.id,
				mockBlogLike.user.id
			);
		});

		it("should throw a bad request error if blog is already liked", async () => {
			const blogLikesRepositoryGetOneSpy = jest
				.spyOn(BlogLikesRepository, "getOne")
				.mockResolvedValue(mockBlogLike);

			await expect(
				BlogLikesService.likeBlog(mockBlogLike.blog.id, mockBlogLike.user.id)
			).rejects.toThrow(BadRequestError);

			expect(blogLikesRepositoryGetOneSpy).toHaveBeenCalledTimes(1);
			expect(blogLikesRepositoryGetOneSpy).toHaveBeenLastCalledWith(
				mockBlogLike.blog.id,
				mockBlogLike.user.id
			);
		});
	});

	describe("unlikeBlog", () => {
		it("should unlike a blog", async () => {
			const blogLikesRepositoryDeleteSpy = jest
				.spyOn(BlogLikesRepository, "delete")
				.mockResolvedValue({ affected: 1, raw: "" });

			await expect(
				BlogLikesService.unlikeBlog(mockBlogLike.blog.id, mockBlogLike.user.id)
			).resolves.toBeUndefined();

			expect(blogLikesRepositoryDeleteSpy).toHaveBeenCalledTimes(1);
			expect(blogLikesRepositoryDeleteSpy).toHaveBeenLastCalledWith(
				mockBlogLike.blog.id,
				mockBlogLike.user.id
			);
		});

		it("should throw an error if blog is not liked", async () => {
			const blogLikesRepositoryDeleteSpy = jest
				.spyOn(BlogLikesRepository, "delete")
				.mockResolvedValue({ affected: 0, raw: "" });

			await expect(
				BlogLikesService.unlikeBlog(mockBlogLike.blog.id, mockBlogLike.user.id)
			).rejects.toThrow(BadRequestError);

			expect(blogLikesRepositoryDeleteSpy).toHaveBeenCalledTimes(1);
			expect(blogLikesRepositoryDeleteSpy).toHaveBeenLastCalledWith(
				mockBlogLike.blog.id,
				mockBlogLike.user.id
			);
		});
	});
});
