import { AppDataSource } from "#/database/database";
import { SignUpRequestBodyDto } from "../auth/dto/request/sign-up-request-body.dto";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

export class UsersRepository {
	private static repository: Repository<User> = AppDataSource.getRepository(User);

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
}
