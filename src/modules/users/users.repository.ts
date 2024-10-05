import { db } from "#/database/database";
import { randomUUID } from "crypto";
import { SignUpRequestBodyDto } from "../auth/dto/request/sign-up-request-body.dto";
import { UserModel } from "./users.model";

export class UsersRepository {
	private static readonly userColumns: string = `id, email, username, password, role, created_at as createdAt`;

	static async getOneByEmail({ email }: { email: string }): Promise<UserModel | null> {
		const [user] = await db.execute<UserModel>(
			`
        SELECT
            ${this.userColumns}
        FROM
            users
        WHERE
            email = $1;
    `,
			[email]
		);

		if (!user) {
			return null;
		}

		return user;
	}

	static async getOneById({ id }: { id: string }): Promise<UserModel | null> {
		const [user] = await db.execute<UserModel>(
			`
        SELECT
            ${this.userColumns}
        FROM
            users
        WHERE
            id = $1;
    `,
			[id]
		);

		if (!user) {
			return null;
		}

		return user;
	}

	static async createOne(user: SignUpRequestBodyDto): Promise<UserModel> {
		const [newUser] = await db.execute<UserModel>(
			`
        INSERT INTO users (id, email, username, password)
        VALUES ($1, $2, $3, $4)
        RETURNING ${this.userColumns};
    `,
			[randomUUID(), user.email, user.username, user.password]
		);

		if (!newUser) {
			throw new Error("Database error");
		}

		return newUser;
	}
}
