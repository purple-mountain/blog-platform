import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
	ADMIN = "admin",
	USER = "user",
}

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

	@Column({ type: "enum", enum: Role, default: Role.USER })
	role!: Role;

	@CreateDateColumn({
		type: "timestamptz",
		name: "created_at",
	})
	createdAt!: Date;
}
