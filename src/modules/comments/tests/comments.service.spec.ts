import { NotFoundError } from "#/shared/errors/not-found-error";
import { randomUUID } from "crypto";
import { CommentsRepository } from "../comments.repository";
import { CommentsService } from "../comments.service";
import { Comment } from "../entities/comment.entity";

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

describe("CommentsService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const updateCommentData = {
		content: "Comment 1",
	};

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
