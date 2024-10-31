import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { BlogsController } from "../../src/modules/blogs/blogs.controller";
import { CommentsController } from "../../src/modules/comments/comments.controller";
import { BlogLikesController } from "../../src/modules/blog-likes/blog-likes.controller";
import { UsersController } from "../../src/modules/users/users.controller";
import { errorMiddleware } from "../../src/shared/middlewares/error.middleware";
import { notFoundMiddleware } from "../../src/shared/middlewares/not-found.middleware";
import { SeederOptions } from "typeorm-extension";
import { CommentsFactory } from "../../src/database/factories/comments.factory";
import { BlogLikesFactory } from "../../src/database/factories/blog-likes.factory";
import { MainSeeder } from "../../src/database/seeders/main.seeder";
import { UsersFactory } from "../../src/database/factories/users.factory";
import { BlogsFactory } from "../../src/database/factories/blogs.factory";
import { TestDatabase } from "../database/test-database";
import { AuthData } from "../shared/types/auth-data.type";
import { BlogsRepository } from "../../src/modules/blogs/blogs.repository";
import { Blog } from "../../src/modules/blogs/entities/blog.entity";
import { UsersRepository } from "../../src/modules/users/users.repository";
import { User } from "../../src/modules/users/entities/user.entity";
import { CommentsRepository } from "../../src/modules/comments/comments.repository";
import { Comment } from "../../src/modules/comments/entities/comment.entity";
import { BlogLikesRepository } from "../../src/modules/blog-likes/blog-likes.repository";
import { BlogLike } from "../../src/modules/blog-likes/entities/blog-like.entity";
import { TestRedisClient } from "../redis/test-redis-client";
import { SignUpRequestBodyDto } from "../../src/modules/auth/dto/request/sign-up-request-body.dto";
import { CreateBlogRequestBodyDto } from "../../src/modules/blogs/dto/request/create-blog-request-body.dto";
import { createTestBlog } from "../shared/helpers/create-new-blog";
import { createTestUser } from "../shared/helpers/create-new-user";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", AuthController);
app.use("/blogs", BlogsController);
app.use("/", CommentsController);
app.use("/users", UsersController);
app.use("/blogs", BlogLikesController);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

describe("User End-to-End flow", () => {
	let testDatabase: TestDatabase;
	let testRedisClient: TestRedisClient;
	let user: {
		authData: AuthData;
		data: User;
		password: string;
	};

	beforeAll(async () => {
		const options: SeederOptions = {
			factories: [UsersFactory, BlogsFactory, CommentsFactory, BlogLikesFactory],
			seeds: [MainSeeder],
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
			{
				repository: BlogLikesRepository,
				entity: BlogLike,
			},
		]);

		testRedisClient = new TestRedisClient({ lazyConnect: true });

		await testRedisClient.start();
	}, 60000);

	afterAll(async () => {
		await testDatabase.stop();
		await testRedisClient.stop();
	});

	describe("User signs up", () => {
		const signUpData: SignUpRequestBodyDto = {
			email: "joe@test.com",
			username: "joe",
			password: "password",
		};

		it("should sign up successfully", async () => {
			const response = await request(app).post("/auth/sign-up").send(signUpData);

			const expectedUser = await UsersRepository.getOneByEmail({
				email: signUpData.email,
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				message: "User signed up successfully",
				data: JSON.parse(JSON.stringify(expectedUser)),
			});
		});

		it("should login successfully", async () => {
			const response = await request(app)
				.post("/auth/login")
				.send({ email: signUpData.email, password: signUpData.password });

			const expectedUser = await UsersRepository.getOneByEmail({
				email: signUpData.email,
			});

			expect(response.status).toBe(200);

			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedUser)),
				message: "User logged in successfully",
			});

			const cookies = response.headers["set-cookie"] as unknown as string[];

			user = {
				data: response.body.data,
				authData: {
					accessToken: cookies[0] || "",
					refreshToken: cookies[1] || "",
				},
				password: signUpData.password,
			};
		});
	});

	describe("User Manages Blogs", () => {
		let blog: Blog | null;
		const newBlogData: CreateBlogRequestBodyDto = {
			title: "New Blog",
			content: "New Blog Content",
			tags: ["blog", "new", "simple"],
		};

		it("user should create a new blog successfully", async () => {
			const response = await request(app)
				.post("/blogs")
				.send(newBlogData)
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			blog = await BlogsRepository.getOne({ id: response.body.data.id });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(blog)),
				message: "Blog created successfully",
			});
		});

		it("user should view blogs of other users", async () => {
			const response = await request(app).get("/blogs");

			const expectecBlogs = await BlogsRepository.getAll({});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectecBlogs)),
				message: "Blogs retrieved successfully",
			});
		});

		it("user should modify their blog successfully", async () => {
			const response = await request(app)
				.put(`/blogs/${blog?.id}`)
				.send({ title: "Updated Blog" })
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(
					JSON.stringify({
						...blog,
						title: "Updated Blog",
						updatedAt: response.body.data.updatedAt,
					})
				),
				message: "Blog updated successfully",
			});
		});
	});

	describe("User Manages Comments", () => {
		let blog: Blog;

		beforeAll(async () => {
			blog = await createTestBlog(app, user.authData);
		});

		it("user should view comments of a blog", async () => {
			const response = await request(app).get(`/blogs/${blog.id}/comments`);

			const expectedComments = await CommentsRepository.getAllByBlogId({}, blog.id);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedComments)),
				message: "Blog comments retrieved successfully",
			});
		});

		it("user should write a new comment for a blog", async () => {
			const response = await request(app)
				.post(`/blogs/${blog.id}/comments`)
				.send({ content: "Test comment" })
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			const expectedComment = await CommentsRepository.getOne({
				id: response.body.data.id,
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedComment)),
				message: "Blog comment created successfully",
			});
		});
	});

	describe("User Manages Blog Likes", () => {
		let blog: Blog;
		let currentLikeCount: number;

		beforeAll(async () => {
			const anotherUser = await createTestUser(app);
			blog = await createTestBlog(app, anotherUser.authData);
			currentLikeCount = await BlogLikesRepository.count(blog.id);
		});

		it("user should see likes on another user's blog", async () => {
			const response = await request(app).get(`/blogs/${blog.id}/likes`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: currentLikeCount,
				message: "Like count retrieved successfully",
			});
		});

		it("user should like another user's blog", async () => {
			const response = await request(app)
				.post(`/blogs/${blog.id}/likes`)
				.set("Cookie", [user.authData.accessToken, user.authData.refreshToken]);

			expect(response.status).toBe(200);

			const actualLikeCount = await BlogLikesRepository.count(blog.id);

			expect(actualLikeCount).toBe(currentLikeCount + 1);
		});
	});
});
