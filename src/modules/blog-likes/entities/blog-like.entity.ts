import { Blog } from "#/modules/blogs/entities/blog.entity";
import { User } from "#/modules/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, Unique } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "blog_like" })
@Unique(["user", "blog"])
export class BlogLike {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user!: Pick<User, "id">;

	@ManyToOne(() => Blog, { onDelete: "CASCADE" })
	blog!: Pick<Blog, "id">;

	@CreateDateColumn({
		type: "timestamptz",
		name: "liked_at",
	})
	likedAt!: Date;
}
