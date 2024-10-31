import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { BlogsController } from "../../src/modules/blogs/blogs.controller";
import { BlogLikesController } from "../../src/modules/blog-likes/blog-likes.controller";
import { errorMiddleware } from "../../src/shared/middlewares/error.middleware";
import { SeederOptions } from "typeorm-extension";
import { Blog } from "../../src/modules/blogs/entities/blog.entity";
import { User } from "../../src/modules/users/entities/user.entity";
import { BlogLike } from "../../src/modules/blog-likes/entities/blog-like.entity";
import { BlogsFactory } from "../../src/database/factories/blogs.factory";
import { UsersFactory } from "../../src/database/factories/users.factory";
import { BlogLikesFactory } from "../../src/database/factories/blog-likes.factory";
import { UsersRepository } from "../../src/modules/users/users.repository";
import { BlogsRepository } from "../../src/modules/blogs/blogs.repository";
import { BlogLikesRepository } from "../../src/modules/blog-likes/blog-likes.repository";
import { BlogLikesSeeder } from "../../src/database/seeders/blog-likes.seeder";
import { TestDatabase } from "../database/test-database";
import { TestRedisClient } from "../redis/test-redis-client";
import { AuthData } from "../shared/types/auth-data.type";
import { createTestUser } from "../shared/helpers/create-new-user";
import { createTestBlog } from "../shared/helpers/create-new-blog";
import { redisClient } from "../../src/redis/redis-client";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/blogs", BlogsController);
app.use("/auth", AuthController);
app.use("/blogs", BlogLikesController);

app.use(errorMiddleware);

describe("Blog Likes Management", () => {
	let testDatabase: TestDatabase;
	let testRedisClient: TestRedisClient;
	let authData: AuthData;
	let blog: Blog;

	beforeAll(async () => {
		const options: SeederOptions = {
			factories: [UsersFactory, BlogsFactory, BlogLikesFactory],
			seeds: [BlogLikesSeeder],
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
				repository: BlogLikesRepository,
				entity: BlogLike,
			},
		]);

		const testUserPayload = await createTestUser(app);

		authData = testUserPayload.authData;

		testRedisClient = new TestRedisClient({ lazyConnect: true });

		await testRedisClient.start();

		blog = await createTestBlog(app, authData);
	}, 60000);

	afterAll(async () => {
		await testDatabase.stop();
		await testRedisClient.stop();
	});

	describe("GET /blogs/:blogId/likes", () => {
		it("should get like count of a blog", async () => {
			const response = await request(app).get(`/blogs/${blog.id}/likes`);

			expect(response.status).toBe(200);

			const expectedLikes = await BlogLikesRepository.count(blog.id);

			expect(response.body).toEqual({
				data: expectedLikes,
				message: "Like count retrieved successfully",
			});
		});
	});

	describe("POST /blogs/:blogId/likes", () => {
		let likeCountBefore: number;

		beforeAll(async () => {
			likeCountBefore = await BlogLikesRepository.count(blog.id);
		});

		it("should like a blog", async () => {
			const response = await request(app)
				.post(`/blogs/${blog.id}/likes`)
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

			expect(response.status).toBe(200);

			const likeCountAfter = await BlogLikesRepository.count(blog.id);

			expect(likeCountAfter).toBe(likeCountBefore + 1);

			expect(redisClient.get(`blog:${blog.id}:likes`)).resolves.toBe(
				likeCountAfter.toString()
			);
		});

		it("should not like a blog if the user has already liked it", async () => {
			const response = await request(app)
				.post(`/blogs/${blog.id}/likes`)
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

			expect(response.status).toBe(400);
			expect(response.body).toEqual({
				message: "User has already liked this blog",
			});
		});
	});

	describe("DELETE /blogs/:blogId/likes", () => {
		let likeCountBefore: number;

		beforeAll(async () => {
			likeCountBefore = await BlogLikesRepository.count(blog.id);
		});

		it("should unlike a blog", async () => {
			const response = await request(app)
				.delete(`/blogs/${blog.id}/likes`)
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

			expect(response.status).toBe(204);

			const likeCountAfter = await BlogLikesRepository.count(blog.id);

			expect(likeCountAfter).toBe(likeCountBefore - 1);
		});

		it("should not unlike a blog if the user has not liked it", async () => {
			const response = await request(app)
				.delete(`/blogs/${blog.id}/likes`)
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

			expect(response.status).toBe(400);
			expect(response.body).toEqual({
				message: "User has not liked this blog",
			});
		});
	});
});
