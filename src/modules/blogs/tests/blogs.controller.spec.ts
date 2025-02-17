import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { BlogsController } from "#/modules/blogs/blogs.controller";
import { BlogsService } from "../blogs.service";
import { randomUUID } from "crypto";
import { Blog } from "../entities/blog.entity";

const app = express();

app.use(express.json());

app.use("/blogs", BlogsController);

jest.mock("../blogs.service");

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

jest.mock("#/shared/validators/request-body.validator", () => ({
	validateRequestBody: () => (_req: Request, _res: Response, next: NextFunction) => {
		next();
	},
}));

jest.mock("#/shared/middlewares/check-resource-ownership.middleware", () => ({
	checkResourceOwnership: () => (_req: Request, _res: Response, next: NextFunction) =>
		next(),
}));

const mockBlogs = [
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

const mockBlog = mockBlogs[0] as Blog;

describe("BlogsController", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /blogs", () => {
		it("should get all blogs", async () => {
			(BlogsService.getBlogs as jest.Mock).mockResolvedValue(mockBlogs);

			const response = await request(app).get("/blogs");

			expect(response.status).toBe(200);

			expect(response.body).toEqual({
				data: mockBlogs.map((mockBlog) => ({
					...mockBlog,
					createdAt: mockBlog?.createdAt.toISOString(),
					updatedAt: mockBlog?.updatedAt.toISOString(),
				})),
				message: "Blogs retrieved successfully",
			});
		});
	});

	describe("GET /blogs/:id", () => {
		it("should get a single blog", async () => {
			(BlogsService.getBlog as jest.Mock).mockResolvedValue(mockBlog);

			const response = await request(app).get("/blogs/" + 1);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: {
					...mockBlog,
					updatedAt: mockBlog?.updatedAt.toISOString(),
					createdAt: mockBlog?.createdAt.toISOString(),
				},
				message: "Blog retrieved successfully",
			});
		});
	});

	describe("POST /blogs", () => {
		it("should create blog", async () => {
			(BlogsService.createBlog as jest.Mock).mockResolvedValue(mockBlog);

			const response = await request(app)
				.post("/blogs")
				.send({ title: "Blog 1", content: "Content 1", tags: ["tag1"] });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: {
					...mockBlog,
					updatedAt: mockBlog?.updatedAt.toISOString(),
					createdAt: mockBlog?.createdAt.toISOString(),
				},
				message: "Blog created successfully",
			});
		});
	});

	describe("PUT /blogs/:id", () => {
		it("should update blog", async () => {
			(BlogsService.updateBlog as jest.Mock).mockResolvedValue(mockBlog);

			const response = await request(app)
				.put("/blogs/" + 1)
				.send({
					title: "Blog 1",
					content: "Content 1",
					tags: ["tag1"],
				});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: {
					...mockBlog,
					updatedAt: mockBlog?.updatedAt.toISOString(),
					createdAt: mockBlog?.createdAt.toISOString(),
				},
				message: "Blog updated successfully",
			});
		});
	});

	describe("DELETE /blogs/:id", () => {
		it("should delete a blog", async () => {
			(BlogsService.deleteBlog as jest.Mock).mockResolvedValue(undefined);

			const response = await request(app).delete("/blogs/" + 1);

			expect(response.status).toBe(204);
		});
	});
});
