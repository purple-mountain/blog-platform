import { SignUpRequestBodyDto } from "../auth/dto/request/sign-up-request-body.dto";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { db } from "#/database/database";

export class UsersRepository {
	private static repository: Repository<User> = db.getDataSource().getRepository(User);

	static async getOneByEmail({ email }: { email: string }): Promise<User | null> {
		return await this.repository.findOne({ where: { email } });
	}

	static async getOneById({ id }: { id: string }): Promise<User | null> {
		return await this.repository.findOne({ where: { id } });
	}

	static async createOne(user: SignUpRequestBodyDto): Promise<User> {
		const newUser = this.repository.create(user);

		return await this.repository.save(newUser);
	}

	static async updateOne(data: Partial<User>, userId: string): Promise<User | null> {
		const user = await this.repository.findOne({ where: { id: userId } });

		if (!user) {
			return null;
		}

		const updatedUser = await this.repository.save({ ...user, ...data });

		return updatedUser;
	}

	static setRepository(repository: Repository<User>) {
		this.repository = repository;
	}
}
