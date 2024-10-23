import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { BlogLike } from "../entities/blog-like.entity";
import { BlogLikesController } from "../blog-likes.controller";
import { BlogLikesService } from "../blog-likes.service";

const app = express();

app.use(express.json());
app.use("/blogs", BlogLikesController);

jest.mock("../blog-likes.service");

jest.mock("#/shared/middlewares/auth.middleware", () => ({
	auth: (req: Request, _res: Response, next: NextFunction) => {
		req.user = { id: "1", role: "user" };
		next();
	},
}));

jest.mock("#/shared/validators/path-parameter.validator", () => ({
	validatePathParameter: () => (_req: Request, _res: Response, next: NextFunction) =>
		next(),
}));

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

const mockBlogLikeCount = 20;

describe("BlogLikesController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /:blogId/likes", () => {
		it("should get likes count", async () => {
			(BlogLikesService.getBlogLikesCount as jest.Mock).mockResolvedValue(
				mockBlogLikeCount
			);

			const response = await request(app).get("/blogs/1/likes");

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: mockBlogLikeCount,
				message: "Like count retrieved successfully",
			});
		});
	});

	describe("POST /:blogId/likes", () => {
		it("should like a blog and return like info", async () => {
			(BlogLikesService.likeBlog as jest.Mock).mockResolvedValue(mockBlogLike);

			const response = await request(app).post("/blogs/1/likes");

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: {
					...mockBlogLike,
					likedAt: mockBlogLike.likedAt.toISOString(),
				},
				message: "Blog has been liked successfully",
			});
		});
	});

	describe("DELETE /:blogId/likes", () => {
		it("should unlike a blog", async () => {
			(BlogLikesService.unlikeBlog as jest.Mock).mockResolvedValue(undefined);

			const response = await request(app).delete("/blogs/1/likes");

			expect(response.status).toBe(204);
		});
	});
});
