import { User } from "#/modules/users/entities/user.entity";
import { Blog } from "#/modules/blogs/entities/blog.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { faker } from "@faker-js/faker";
import { Comment } from "#/modules/comments/entities/comment.entity";

const USERS_COUNT = 10;
const BLOGS_COUNT = 20;
const COMMENTS_COUNT = 40;

export class CommentsSeeder implements Seeder {
	public async run(
		dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<any> {
		const blogsRepository = dataSource.getRepository(Blog);
		const commentsRepository = dataSource.getRepository(Comment);

		const usersFactory = factoryManager.get(User);
		const blogsFactory = factoryManager.get(Blog);
		const commentsFactory = factoryManager.get(Comment);

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
	}
}
