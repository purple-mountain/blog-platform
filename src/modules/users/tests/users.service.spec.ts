import { UserRole } from "#/shared/constants/user-role.constant";
import { NotFoundError } from "#/shared/errors/not-found.error";
import { User } from "../entities/user.entity";
import { UsersRepository } from "../users.repository";
import { UsersService } from "../users.service";

const mockUser: User = {
	id: "1",
	email: "davranbek@example.com",
	username: "davranbek",
	password: "123123123",
	role: UserRole.USER,
	createdAt: new Date(),
};

describe("UsersService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("updateUserRole", () => {
		const updateUserRoleData = {
			role: UserRole.ADMIN,
		};

		it("should return updated user with updated role", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "updateOne")
				.mockResolvedValue(mockUser);

			const result = await UsersService.updateUserRole(updateUserRoleData, mockUser.id);

			expect(result).toEqual(mockUser);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateUserRoleData, mockUser.id);
		});

		it("should throw NotFoundError if user is not found", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "updateOne")
				.mockResolvedValue(null);

			expect(
				UsersService.updateUserRole(updateUserRoleData, mockUser.id)
			).rejects.toThrow(NotFoundError);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateUserRoleData, mockUser.id);
		});
	});
});
