import { setSeederFactory } from "typeorm-extension";
import { BlogLike } from "#/modules/blog-likes/entities/blog-like.entity";

export const BlogLikesFactory = setSeederFactory(BlogLike, () => {
	return new BlogLike();
});
