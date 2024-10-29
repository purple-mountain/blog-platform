import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { AuthData } from "../shared/types/auth-data.type";
import { SeederOptions } from "typeorm-extension";
import { UsersFactory } from "../../src/database/factories/users.factory";
import { BlogsFactory } from "../../src/database/factories/blogs.factory";
import { CommentsFactory } from "../../src/database/factories/comments.factory";
import { CommentsSeeder } from "../../src/database/seeders/comments.seeder";
import { TestDatabase } from "../database/test-database";
import { BlogsRepository } from "../../src/modules/blogs/blogs.repository";
import { UsersRepository } from "../../src/modules/users/users.repository";
import { CommentsRepository } from "../../src/modules/comments/comments.repository";
import { Blog } from "../../src/modules/blogs/entities/blog.entity";
import { User } from "../../src/modules/users/entities/user.entity";
import { Comment } from "../../src/modules/comments/entities/comment.entity";
import { createTestUser } from "../shared/helpers/create-new-user";
import { createTestBlog } from "../shared/helpers/create-new-blog";
import { BlogsController } from "../../src/modules/blogs/blogs.controller";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { CommentsController } from "../../src/modules/comments/comments.controller";
import { errorMiddleware } from "../../src/shared/middlewares/error.middleware";
import { CreateCommentRequestBodyDto } from "../../src/modules/comments/dto/request/create-comment-request-body.dto";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/blogs", BlogsController);
app.use("/auth", AuthController);
app.use("/", CommentsController);

app.use(errorMiddleware);

describe("Comment Management", () => {
	let testBlog: Blog;
	let testUser: User;
	let testDatabase: TestDatabase;
	let authData: AuthData;

	beforeAll(async () => {
		const options: SeederOptions = {
			factories: [UsersFactory, BlogsFactory, CommentsFactory],
			seeds: [CommentsSeeder],
		};

		testDatabase = new TestDatabase(options);

		await testDatabase.start();

		testDatabase.setupRepositories([
			{
				repository: BlogsRepository,
				entity: Blog,
			},
			{
				repository: UsersRepository,
				entity: User,
			},
			{
				repository: CommentsRepository,
				entity: Comment,
			},
		]);

		const testUserPayload = await createTestUser(app);

		authData = testUserPayload.authData;
		testUser = testUserPayload.user;

		testBlog = await createTestBlog(app, authData);
	}, 60000);

	afterAll(async () => {
		await testDatabase.stop();
	});

	describe("GET /blogs/:blogId/comments", () => {
		it("should return all comments of a blog", async () => {
			const expectedComments = await CommentsRepository.getAllByBlogId({}, testBlog.id);
			const response = await request(app).get(`/blogs/${testBlog.id}/comments`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedComments)),
				message: "Blog comments retrieved successfully",
			});
		});

		it("should return all comments of a blog with pagination", async () => {
			const expectedComments = await CommentsRepository.getAllByBlogId(
				{ limit: 3, page: 3 },
				testBlog.id
			);

			const response = await request(app).get(
				`/blogs/${testBlog.id}/comments?page=3&limit=3`
			);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedComments)),
				message: "Blog comments retrieved successfully",
			});
		});
	});

	describe("POST /blogs/:blogId/comments", () => {
		it("should create a new comment", async () => {
			const newCommentData: CreateCommentRequestBodyDto = {
				content: "This is a test comment",
			};

			const response = await request(app)
				.post(`/blogs/${testBlog.id}/comments`)
				.send(newCommentData)
				.set("Cookie", [authData.accessToken, authData.refreshToken]);

			const expectedNewComment = await CommentsRepository.getOne({
				id: response.body.data.id,
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedNewComment)),
				message: "Blog comment created successfully",
			});
		});
	});

	describe("PUT /comments/:id", () => {
		let comment: Comment;

		beforeAll(async () => {
			comment = await CommentsRepository.createOne(
				{ content: "This is a test comment that will be updated" },
				testUser.id,
				testBlog.id
			);
		});

		it("should update a comment", async () => {
			const response = await request(app)
				.put(`/comments/${comment.id}`)
				.send({
					content: "This is an updated comment",
				})
				.set("Cookie", [authData.accessToken, authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(
					JSON.stringify({
						...comment,
						content: "This is an updated comment",
						updatedAt: response.body.data.updatedAt,
					})
				),
				message: "Comment updated successfully",
			});
		});

		it("should not update a comment if the user is not the author", async () => {
			const randomUserAuthData = (await createTestUser(app)).authData;

			const response = await request(app)
				.put(`/comments/${comment.id}`)
				.send({
					content: "This is an updated comment by a random user",
				})
				.set("Cookie", [randomUserAuthData.accessToken, randomUserAuthData.refreshToken]);

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "You are not authorized to perform this action",
			});
		});
	});

	describe("DELETE /comments/:id", () => {
		it("should delete a comment", async () => {
			const comment = await CommentsRepository.createOne(
				{ content: "This is a test comment that will be deleted" },
				testUser.id,
				testBlog.id
			);

			const response = await request(app)
				.delete(`/comments/${comment.id}`)
				.set("Cookie", [authData.accessToken, authData.refreshToken]);

			const deletedComment = await CommentsRepository.getOne({ id: comment.id });

			expect(response.status).toBe(204);
			expect(deletedComment).toBeNull();
		});

		it("should not delete a comment if the user is not the author", async () => {
			const randomUserAuthData = (await createTestUser(app)).authData;

			const comment = await CommentsRepository.createOne(
				{ content: "This is a test comment that will be deleted" },
				testUser.id,
				testBlog.id
			);

			const response = await request(app)
				.delete(`/comments/${comment.id}`)
				.set("Cookie", [randomUserAuthData.accessToken, randomUserAuthData.refreshToken]);

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "You are not authorized to perform this action",
			});
		});
	});
});
