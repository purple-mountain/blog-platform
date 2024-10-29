import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { SeederOptions } from "typeorm-extension";
import { errorMiddleware } from "../../src/shared/middlewares/error.middleware";
import { BlogsController } from "../../src/modules/blogs/blogs.controller";
import { Blog } from "../../src/modules/blogs/entities/blog.entity";
import { BlogsRepository } from "../../src/modules/blogs/blogs.repository";
import { BlogsSeeder } from "../../src/database/seeders/blogs.seeder";
import { BlogsFactory } from "../../src/database/factories/blogs.factory";
import { UsersFactory } from "../../src/database/factories/users.factory";
import { BlogsSearchParamsDto } from "../../src/modules/blogs/dto/request/blog-search-params.dto";
import { User } from "../../src/modules/users/entities/user.entity";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { CreateBlogRequestBodyDto } from "../../src/modules/blogs/dto/request/create-blog-request-body.dto";
import { db } from "../../src/database/database";
import { UsersRepository } from "../../src/modules/users/users.repository";
import { AuthData } from "../shared/types/auth-data.type";
import { TestDatabase } from "../database/test-database";
import { createTestUser } from "../shared/helpers/create-new-user";
import { createTestBlog } from "../shared/helpers/create-new-blog";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/blogs", BlogsController);
app.use("/auth", AuthController);

app.use(errorMiddleware);

describe("Blog Management", () => {
	let testDatabase: TestDatabase;
	let authData: AuthData;

	beforeAll(async () => {
		const options: SeederOptions = {
			factories: [UsersFactory, BlogsFactory],
			seeds: [BlogsSeeder],
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
		]);

		const testUser = await createTestUser(app);

		authData = testUser.authData;
	}, 60000);

	afterAll(async () => {
		await testDatabase.stop();
	});

	describe("GET /blogs", () => {
		it("should get all blogs", async () => {
			const expectedBlogs: Blog[] = await BlogsRepository.getAll({});

			const response = await request(app).get("/blogs");

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedBlogs)),
				message: "Blogs retrieved successfully",
			});
		});

		it("should get all blogs with search params", async () => {
			const searchParams: BlogsSearchParamsDto = {
				page: 2,
				limit: 5,
			};

			const expectedBlogs: Blog[] = await BlogsRepository.getAll(searchParams);

			const response = await request(app).get("/blogs?page=2&limit=5");

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedBlogs)),
				message: "Blogs retrieved successfully",
			});
		});
	});

	describe("GET /blogs/:id", () => {
		it("should get a blog by id", async () => {
			const blog = await db
				.getDataSource()
				.getRepository(Blog)
				.createQueryBuilder("blog")
				.leftJoinAndSelect("blog.author", "author")
				.select(["blog", "author.id", "author.username", "author.email"])
				.orderBy("RANDOM()")
				.getOne();

			const response = await request(app).get(`/blogs/${blog?.id}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(blog)),
				message: "Blog retrieved successfully",
			});
		});
	});

	describe("POST /blogs", () => {
		it("should create a new blog", async () => {
			const newBlogData: CreateBlogRequestBodyDto = {
				title: "New Blog",
				content: "This is a new blog",
				tags: ["new", "blog"],
			};

			const response = await request(app)
				.post("/blogs")
				.send(newBlogData)
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

			const expectedNewBlog = await BlogsRepository.getOne({ id: response.body.data.id });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				data: JSON.parse(JSON.stringify(expectedNewBlog)),
				message: "Blog created successfully",
			});
		});
	});

	describe("PUT /blogs/:id", () => {
		let blog: Blog;
		let randomUserAuthData: AuthData;

		beforeAll(async () => {
			blog = await createTestBlog(app, authData);
			randomUserAuthData = (await createTestUser(app)).authData;
		});

		it("should update a blog", async () => {
			const response = await request(app)
				.put(`/blogs/${blog.id}`)
				.send({ title: "Updated Blog" })
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

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

		it("should not update a blog if the user is not the author", async () => {
			const response = await request(app)
				.put(`/blogs/${blog.id}`)
				.send({ title: "Updated Blog" })
				.set("Cookie", [
					randomUserAuthData["accessToken"],
					randomUserAuthData["refreshToken"],
				]);

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "You are not authorized to perform this action",
			});
		});
	});

	describe("DELETE /blogs/:id", () => {
		let blog: Blog;
		let randomUserAuthData: AuthData;

		beforeAll(async () => {
			blog = await createTestBlog(app, authData);
			randomUserAuthData = (await createTestUser(app)).authData;
		});

		it("should delete a blog", async () => {
			const response = await request(app)
				.delete(`/blogs/${blog.id}`)
				.set("Cookie", [authData["accessToken"], authData["refreshToken"]]);

			expect(response.status).toBe(204);
			expect(response.body).toEqual({});

			const deletedBlog = await BlogsRepository.getOne({ id: blog.id });

			expect(deletedBlog).toBeNull();
		});

		it("should not delete a blog if the user is not the author", async () => {
			blog = await createTestBlog(app, authData);
			const response = await request(app)
				.delete(`/blogs/${blog.id}`)
				.set("Cookie", [
					randomUserAuthData["accessToken"],
					randomUserAuthData["refreshToken"],
				]);

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				message: "You are not authorized to perform this action",
			});
		});
	});
});
