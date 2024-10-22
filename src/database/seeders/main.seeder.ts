import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { faker } from "@faker-js/faker";
import { User } from "#/modules/users/entities/user.entity";
import { Blog } from "#/modules/blogs/entities/blog.entity";
import { Comment } from "#/modules/comments/entities/comment.entity";

export class MainSeeder implements Seeder {
	public async run(
		dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<any> {
		const blogsRepository = dataSource.getRepository(Blog);
		const commentsRepository = dataSource.getRepository(Comment);

		const usersFactory = factoryManager.get(User);
		const blogsFactory = factoryManager.get(Blog);
		const commentsFactory = factoryManager.get(Comment);

		const users = await usersFactory.saveMany(8);
		const blogs = await Promise.all(
			Array(20)
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
			Array(40)
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
