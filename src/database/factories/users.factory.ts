import { setSeederFactory } from "typeorm-extension";
import { User } from "#/modules/users/entities/user.entity";
import { UserRole } from "#/shared/constants/user-role.constant";

export const UsersFactory = setSeederFactory(User, (faker) => {
	const user = new User();

	user.email = faker.internet.email();
	user.username = faker.internet.userName();
	user.password = faker.internet.password();
	user.role = faker.helpers.arrayElement([UserRole.ADMIN, UserRole.USER]);

	return user;
});
