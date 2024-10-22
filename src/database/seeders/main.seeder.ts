import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { faker } from "@faker-js/faker";
import { User } from "#/modules/users/entities/user.entity";
import { Blog } from "#/modules/blogs/entities/blog.entity";
import { Comment } from "#/modules/comments/entities/comment.entity";
import { BlogLike } from "#/modules/blog-likes/entities/blog-like.entity";

const USERS_COUNT = 8;
const BLOGS_COUNT = 20;
const COMMENTS_COUNT = 40;
const BLOG_LIKES_COUNT = (USERS_COUNT - 3) * BLOGS_COUNT;

export class MainSeeder implements Seeder {
	public async run(
		dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<any> {
		const blogsRepository = dataSource.getRepository(Blog);
		const commentsRepository = dataSource.getRepository(Comment);
		const blogLikesRepository = dataSource.getRepository(BlogLike);

		const usersFactory = factoryManager.get(User);
		const blogsFactory = factoryManager.get(Blog);
		const commentsFactory = factoryManager.get(Comment);
		const blogLikesFactory = factoryManager.get(BlogLike);

		const users = await usersFactory.saveMany(USERS_COUNT);
		const blogs = await Promise.all(
			Array(BLOGS_COUNT)
				.fill("")
				.map(async () => {
					const randomUser = faker.helpers.arrayElement(users);

					const made = await blogsFactory.make({
						author: {
							id: randomUser.id,
							email: randomUser.email,
							username: randomUser.username,
						},
					});

					return made;
				})
		);

		await blogsRepository.save(blogs);

		const comments = await Promise.all(
			Array(COMMENTS_COUNT)
				.fill("")
				.map(async () => {
					const randomUser = faker.helpers.arrayElement(users);
					const randomBlog = faker.helpers.arrayElement(blogs);

					const made = await commentsFactory.make({
						user: {
							id: randomUser.id,
							email: randomUser.email,
							username: randomUser.username,
						},
						blog: {
							id: randomBlog.id,
						},
					});

					return made;
				})
		);

		await commentsRepository.save(comments);

		const uniquePairs = new Set<string>();
		const blogLikes = await Promise.all(
			Array(BLOG_LIKES_COUNT)
				.fill("")
				.map(async () => {
					let randomUser;
					let randomBlog;

					do {
						randomUser = faker.helpers.arrayElement(users);
						randomBlog = faker.helpers.arrayElement(blogs);
					} while (uniquePairs.has(`${randomUser.id}:${randomBlog.id}`));

					uniquePairs.add(`${randomUser.id}:${randomBlog.id}`);

					return await blogLikesFactory.make({
						user: {
							id: randomUser.id,
						},
						blog: {
							id: randomBlog.id,
						},
					});
				})
		);

		await blogLikesRepository.save(blogLikes);
	}
}
