import { User } from "#/modules/users/entities/user.entity";
import {
	Entity,
	Column,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	ManyToOne,
	UpdateDateColumn,
} from "typeorm";

@Entity({ name: "blog" })
export class Blog {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	author!: Pick<User, "id" | "email" | "username">;

	@Column({ type: "varchar", length: 255 })
	title!: string;

	@Column({ type: "text" })
	content!: string;

	@Column({ type: "simple-array" })
	tags!: string[];

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
