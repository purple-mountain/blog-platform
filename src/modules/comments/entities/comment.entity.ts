import { Blog } from "#/modules/blogs/entities/blog.entity";
import { User } from "#/modules/users/entities/user.entity";
import {
	Entity,
	Column,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	ManyToOne,
	UpdateDateColumn,
} from "typeorm";

@Entity({ name: "comment" })
export class Comment {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => Blog, { onDelete: "CASCADE" })
	blog!: Pick<Blog, "id">;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user!: Pick<User, "id" | "email" | "username">;

	@Column({ type: "text" })
	content!: string;

	@CreateDateColumn({
		type: "timestamptz",
		name: "created_at",
	})
	createdAt!: Date;

	@UpdateDateColumn({
		type: "timestamptz",
		name: "updated_at",
	})
	updatedAt!: Date;
}
