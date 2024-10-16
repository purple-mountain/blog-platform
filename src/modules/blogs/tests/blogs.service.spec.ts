import { randomUUID } from "crypto";
import { BlogsRepository } from "../blogs.repository";
import { BlogsService } from "../blogs.service";
import { Blog } from "../entities/blog.entity";
import { NotFoundError } from "#/shared/errors/not-found.error";

const mockBlogs: Blog[] = [
	{
		id: randomUUID(),
		author: { id: "1", email: "davranbek@example.com", username: "davranbek" },
		title: "Blog 1",
		content: "Content 1",
		tags: ["tag1"],
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: randomUUID(),
		author: { id: "1", email: "davranbek@example.com", username: "davranbek" },
		title: "Blog 2",
		content: "Content 2",
		tags: ["tag2"],
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockBlog: Blog = mockBlogs[0] as Blog;

describe("BlogsService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getBlogs", () => {
		it("should return blogs if it is successfull ", async () => {
			const repositorySpy = jest
				.spyOn(BlogsRepository, "getAll")
				.mockResolvedValue(mockBlogs);
			const queryParams = { limit: 10, page: 1 };

			const result = await BlogsService.getBlogs(queryParams);

			expect(result).toEqual(mockBlogs);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(queryParams);
		});
	});

	describe("getBlog", () => {
		it("should return blog if it is successfull ", async () => {
			const repositorySpy = jest
				.spyOn(BlogsRepository, "getOne")
				.mockResolvedValue(mockBlog);

			const result = await BlogsService.getBlog(mockBlog.id);

			expect(result).toEqual(mockBlog);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockBlog.id });
		});

		it("should throw NotFoundError if blog is not found ", async () => {
			const repositorySpy = jest.spyOn(BlogsRepository, "getOne").mockResolvedValue(null);
			const notExistingBlogId = randomUUID();

			expect(BlogsService.getBlog(notExistingBlogId)).rejects.toThrow(NotFoundError);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: notExistingBlogId });
		});
	});

	describe("createBlog", () => {
		it("should return new blog if it is successfull ", async () => {
			const newBlogData = {
				title: "Blog 1",
				content: "Content 1",
				tags: ["tag1"],
			};

			const repositorySpy = jest
				.spyOn(BlogsRepository, "createOne")
				.mockResolvedValue(mockBlog);

			const result = await BlogsService.createBlog(newBlogData, mockBlog.author.id);

			expect(result).toEqual(mockBlog);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(newBlogData, mockBlog.author.id);
		});
	});

	describe("updateBlog", () => {
		const updateBlogData = {
			title: "Updated Blog 1",
			content: "Content 1",
			tags: ["tag1"],
		};

		it("should return new updated blog if it is successfull", async () => {
			const repositorySpy = jest
				.spyOn(BlogsRepository, "updateOne")
				.mockResolvedValue({ ...mockBlog, ...updateBlogData });

			const result = await BlogsService.updateBlog(updateBlogData, mockBlog.author.id);

			expect(result).toEqual({ ...mockBlog, ...updateBlogData });
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateBlogData, mockBlog.author.id);
		});

		it("should throw NotFoundError if blog is not found ", async () => {
			const repositorySpy = jest
				.spyOn(BlogsRepository, "updateOne")
				.mockResolvedValue(null);
			const notExistingBlogId = randomUUID();

			expect(BlogsService.updateBlog(updateBlogData, notExistingBlogId)).rejects.toThrow(
				NotFoundError
			);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateBlogData, notExistingBlogId);
		});
	});

	describe("deleteBlog", () => {
		it("should delete blog if it is successfull and return undefined", async () => {
			const repositorySpy = jest
				.spyOn(BlogsRepository, "deleteOne")
				.mockResolvedValue({ affected: 1, raw: "SQL Query example" });

			const result = await BlogsService.deleteBlog(mockBlog.id);

			expect(result).toEqual(undefined);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockBlog.id });
		});

		it("should throw NotFoundError if blog is not found ", async () => {
			const repositorySpy = jest
				.spyOn(BlogsRepository, "deleteOne")
				.mockResolvedValue({ affected: 0, raw: "SQL Query example" });
			const notExistingBlogId = randomUUID();

			expect(BlogsService.deleteBlog(notExistingBlogId)).rejects.toThrow(NotFoundError);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: notExistingBlogId });
		});
	});
});
