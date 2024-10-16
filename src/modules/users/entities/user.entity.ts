import { UserRole } from "#/shared/constants/user-role.constant";
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "user" })
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar", length: 255, unique: true })
	email!: string;

	@Column({ type: "varchar", length: 255 })
	username!: string;

	@Column({ type: "char", length: 60 })
	password!: string;

	@Column({ type: "enum", enum: UserRole, default: UserRole.USER })
	role!: UserRole;

	@CreateDateColumn({
		type: "timestamptz",
		name: "created_at",
	})
	createdAt!: Date;
}
