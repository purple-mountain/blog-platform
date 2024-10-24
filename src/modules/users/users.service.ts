import bcrypt from "bcrypt";
import { User } from "./entities/user.entity";
import { UpdateUserRoleRequestBodyDto } from "./dto/request/update-user-role-request-body.dto";
import { UsersRepository } from "./users.repository";
import { NotFoundError } from "#/shared/errors/not-found.error";
import { UpdateUserProfileRequestBodyDto } from "./dto/request/update-user-profile-request-body.dto";
import { UpdateUserPasswordRequestBodyDto } from "./dto/request/update-user-password-request-body.dto";
import { UnauthorizedError } from "#/shared/errors/unauthorized.error";

export class UsersService {
	static async getProfile(userId: string): Promise<User> {
		const user = await UsersRepository.getOneById({ id: userId });

		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	}

	static async updateProfile(
		dto: UpdateUserProfileRequestBodyDto,
		userId: string
	): Promise<User> {
		const updatedUser = await UsersRepository.updateOne(dto, userId);

		if (!updatedUser) {
			throw new NotFoundError("User not found");
		}

		return updatedUser;
	}

	static async updatePassword(
		dto: UpdateUserPasswordRequestBodyDto,
		userId: string
	): Promise<void> {
		const user = await UsersRepository.getOneById({ id: userId });

		if (!user) {
			throw new NotFoundError("User not found");
		}

		const isPasswordCorrect = await bcrypt.compare(dto.currentPassword, user.password);

		if (!isPasswordCorrect) {
			throw new UnauthorizedError("Password is incorrect");
		}

		const salt = await bcrypt.genSalt(10);
		const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);

		const updatedUser = await UsersRepository.updateOne(
			{ password: hashedNewPassword },
			userId
		);

		if (!updatedUser) {
			throw new NotFoundError("User not found");
		}
	}

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
