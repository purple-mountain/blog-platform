import { setSeederFactory } from "typeorm-extension";
import { Blog } from "#/modules/blogs/entities/blog.entity";

export const BlogsFactory = setSeederFactory(Blog, (faker) => {
	const blog = new Blog();

	blog.title = faker.lorem.sentence();
	blog.content = faker.lorem.paragraph();
	blog.tags = faker.lorem.words(3).split(" ");

	return blog;
});
