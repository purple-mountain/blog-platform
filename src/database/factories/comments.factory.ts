import { setSeederFactory } from "typeorm-extension";
import { Comment } from "#/modules/comments/entities/comment.entity";

export const CommentsFactory = setSeederFactory(Comment, (faker) => {
	const comment = new Comment();

	comment.content = faker.lorem.paragraph();

	return comment;
});
