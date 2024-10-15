import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { Comment } from "../entities/comment.entity";
import { CommentsService } from "../comments.service";
import { CommentsController } from "../comments.controller";

const app = express();

app.use(express.json());
app.use("/", CommentsController);

jest.mock("../comments.service");

jest.mock("#/shared/middlewares/auth.middleware", () => ({
	auth: jest.fn((req: Request, _res: Response, next: NextFunction) => {
		req.user = { id: "1", role: "user" };
		next();
	}),
}));

jest.mock("#/shared/validators/path-parameter.validator", () => ({
	validatePathParameter: () => (_req: Request, _res: Response, next: NextFunction) =>
		next(),
}));

jest.mock("#/shared/validators/request-body.validator", () => ({
	validateRequestBody: () => (_req: Request, _res: Response, next: NextFunction) => {
		next();
	},
}));

jest.mock("#/shared/middlewares/checkResourceOwnership.middleware", () => ({
	checkResourceOwnership: () => (_req: Request, _res: Response, next: NextFunction) => {
		next();
	},
}));

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

describe("CommentsController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /blogs/:id/comments", () => {
		it("should get all blog comments", async () => {
			(CommentsService.getBlogComments as jest.Mock).mockResolvedValue(mockComments);

			const response = await request(app).get("/blogs/" + 1 + "/comments");

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: mockComments.map((mockComment) => ({
					...mockComment,
					createdAt: mockComment.createdAt.toISOString(),
					updatedAt: mockComment.updatedAt.toISOString(),
				})),
				message: "Blog comments retrieved successfully",
			});
		});
	});

	describe("POST /blogs/:id/comments", () => {
		it("should create a blog comment", async () => {
			(CommentsService.createBlogComment as jest.Mock).mockResolvedValue(mockComment);

			const response = await request(app)
				.post("/blogs/" + 1 + "/comments")
				.send({ content: "Comment 1" });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: {
					...mockComment,
					createdAt: mockComment.createdAt.toISOString(),
					updatedAt: mockComment.updatedAt.toISOString(),
				},
				message: "Blog comment created successfully",
			});
		});
	});

	describe("PUT /comments/:id", () => {
		it("should update a comment", async () => {
			(CommentsService.updateComment as jest.Mock).mockResolvedValue(mockComment);

			const response = await request(app).put("/comments/1").send({
				content: "Comment 1",
			});

			expect(response.status).toBe(200);
			expect(response.body.data).toEqual({
				...mockComment,
				createdAt: mockComment.createdAt.toISOString(),
				updatedAt: mockComment.updatedAt.toISOString(),
			});
		});
	});

	describe("DELETE /comments/:id", () => {
		it("should delete a comment", async () => {
			(CommentsService.deleteComment as jest.Mock).mockResolvedValue(undefined);

			const response = await request(app).delete("/comments/1");

			expect(response.status).toBe(204);
		});
	});
});
