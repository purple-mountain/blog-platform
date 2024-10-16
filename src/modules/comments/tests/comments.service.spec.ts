import { NotFoundError } from "#/shared/errors/not-found.error";
import { randomUUID } from "crypto";
import { CommentsRepository } from "../comments.repository";
import { CommentsService } from "../comments.service";
import { Comment } from "../entities/comment.entity";
import { BlogsRepository } from "#/modules/blogs/blogs.repository";

const mockComments: Comment[] = [
	{
		id: "1",
		content: "Comment 1",
		blog: { id: "1" },
		user: { id: "1", username: "davranbek", email: "davranbek@gmail.com" },
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "2",
		content: "Comment 2",
		blog: { id: "1" },
		user: { id: "1", username: "davranbek", email: "davranbek@gmail.com" },
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const mockComment = mockComments[0] as Comment;

const mockBlog = {
	id: randomUUID(),
	author: { id: "1", email: "davranbek@example.com", username: "davranbek" },
	title: "Blog 1",
	content: "Content 1",
	tags: ["tag1"],
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("CommentsService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const updateCommentData = {
		content: "Comment 1",
	};

	describe("getBlogComments", () => {
		it("should return comments if it is successfull ", async () => {
			const repositorySpy = jest
				.spyOn(CommentsRepository, "getAllByBlogId")
				.mockResolvedValue(mockComments);
			const queryParams = { limit: 10, page: 1 };

			const result = await CommentsService.getBlogComments(queryParams, mockBlog.id);

			expect(result).toEqual(mockComments);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(queryParams, mockBlog.id);
		});

		it("should throw NotFoundError if blog is not found ", async () => {
			const repositorySpy = jest
				.spyOn(CommentsRepository, "getAllByBlogId")
				.mockResolvedValue(null);
			const queryParams = { limit: 10, page: 1 };
			const notExistingBlogId = randomUUID();

			expect(
				CommentsService.getBlogComments(queryParams, notExistingBlogId)
			).rejects.toThrow(NotFoundError);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(queryParams, notExistingBlogId);
		});
	});

	describe("createBlogComment", () => {
		const newCommentData = {
			content: "Comment 1",
		};

		it("should return new comment if it is successfull ", async () => {
			const blogRepositorySpy = jest
				.spyOn(BlogsRepository, "getOne")
				.mockResolvedValue(mockBlog);
			const commentRepositorySpy = jest
				.spyOn(CommentsRepository, "createOne")
				.mockResolvedValue(mockComment);

			const result = await CommentsService.createBlogComment(
				newCommentData,
				mockBlog.author.id,
				mockBlog.id
			);

			expect(result).toEqual(mockComment);

			expect(blogRepositorySpy).toHaveBeenCalledTimes(1);
			expect(blogRepositorySpy).toHaveBeenLastCalledWith({ id: mockBlog.id });

			expect(commentRepositorySpy).toHaveBeenCalledTimes(1);
			expect(commentRepositorySpy).toHaveBeenLastCalledWith(
				newCommentData,
				mockBlog.author.id,
				mockBlog.id
			);
		});

		it("should throw NotFoundError if blog is not found ", async () => {
			const blogRepositorySpy = jest
				.spyOn(BlogsRepository, "getOne")
				.mockResolvedValue(null);
			const commentRepositorySpy = jest
				.spyOn(CommentsRepository, "createOne")
				.mockResolvedValue(mockComment);

			expect(
				CommentsService.createBlogComment(newCommentData, mockBlog.author.id, mockBlog.id)
			).rejects.toThrow(NotFoundError);

			expect(blogRepositorySpy).toHaveBeenCalledTimes(1);
			expect(blogRepositorySpy).toHaveBeenLastCalledWith({ id: mockBlog.id });
			expect(commentRepositorySpy).toHaveBeenCalledTimes(0);
		});
	});

	describe("updateComment", () => {
		it("should update a comment", async () => {
			const repositorySpy = jest
				.spyOn(CommentsRepository, "updateOne")
				.mockResolvedValue(mockComment);

			const result = await CommentsService.updateComment(
				updateCommentData,
				mockComment.id
			);

			expect(result).toEqual(mockComment);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateCommentData, mockComment.id);
		});

		it("should throw NotFoundError if comment is not found", async () => {
			const repositorySpy = jest
				.spyOn(CommentsRepository, "updateOne")
				.mockResolvedValue(null);

			expect(
				CommentsService.updateComment(updateCommentData, mockComment.id)
			).rejects.toThrow(NotFoundError);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateCommentData, mockComment.id);
		});
	});

	describe("deleteComment", () => {
		it("should delete a comment", async () => {
			const repositorySpy = jest
				.spyOn(CommentsRepository, "deleteOne")
				.mockResolvedValue({ affected: 1, raw: "SQL Query example" });

			const result = await CommentsService.deleteComment(mockComment.id);

			expect(result).toEqual(undefined);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockComment.id });
		});

		it("should throw NotFoundError if comment is not found", async () => {
			const repositorySpy = jest
				.spyOn(CommentsRepository, "deleteOne")
				.mockResolvedValue({ affected: 0, raw: "SQL Query example" });
			const notExistingCommentId = randomUUID();

			expect(CommentsService.deleteComment(notExistingCommentId)).rejects.toThrow(
				NotFoundError
			);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: notExistingCommentId });
		});
	});
});
