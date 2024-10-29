import { User } from "#/modules/users/entities/user.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

const USERS_COUNT = 10;

export class UsersSeeder implements Seeder {
	public async run(
		_dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<any> {
		const usersFactory = factoryManager.get(User);

		await usersFactory.saveMany(USERS_COUNT);
	}
}
