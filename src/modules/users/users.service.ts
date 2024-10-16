import { User } from "./entities/user.entity";
import { UpdateUserRoleRequestBodyDto } from "./dto/request/update-user-role-request-body.dto";
import { UsersRepository } from "./users.repository";
import { NotFoundError } from "#/shared/errors/not-found.error";

export class UsersService {
	static async updateUserRole(
		dto: UpdateUserRoleRequestBodyDto,
		userId: string
	): Promise<User> {
		const updatedUser = await UsersRepository.updateOne(dto, userId);

		if (!updatedUser) {
			throw new NotFoundError("User not found");
		}

		return updatedUser;
	}
}
