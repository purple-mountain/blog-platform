import request from "supertest";
import Express from "express";
import { faker } from "@faker-js/faker";
import { CreateBlogRequestBodyDto } from "../../../src/modules/blogs/dto/request/create-blog-request-body.dto";
import { Blog } from "../../../src/modules/blogs/entities/blog.entity";
import { AuthData } from "../types/auth-data.type";

export async function createTestBlog(
	app: Express.Application,
	authData: AuthData
): Promise<Blog> {
	const newBlogData: CreateBlogRequestBodyDto = {
		title: faker.lorem.sentence(),
		content: faker.lorem.paragraphs(3),
		tags: faker.lorem.words(3).split(" "),
	};

	const response = await request(app)
		.post("/blogs")
		.send(newBlogData)
		.set("Cookie", [authData.accessToken, authData.refreshToken]);

	return response.body.data;
}
