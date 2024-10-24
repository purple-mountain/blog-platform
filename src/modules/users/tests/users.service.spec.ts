import bcrypt from "bcrypt";
import { UserRole } from "#/shared/constants/user-role.constant";
import { NotFoundError } from "#/shared/errors/not-found.error";
import { User } from "../entities/user.entity";
import { UsersRepository } from "../users.repository";
import { UsersService } from "../users.service";
import { UpdateUserProfileRequestBodyDto } from "../dto/request/update-user-profile-request-body.dto";
import { UpdateUserPasswordRequestBodyDto } from "../dto/request/update-user-password-request-body.dto";
import { UnauthorizedError } from "#/shared/errors/unauthorized.error";

jest.mock("bcrypt");

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

	describe("getProfile", () => {
		it("should return user profile", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneById")
				.mockResolvedValue(mockUser);

			const result = await UsersService.getProfile(mockUser.id);

			expect(result).toEqual(mockUser);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockUser.id });
		});

		it("should throw NotFoundError if user is not found", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneById")
				.mockResolvedValue(null);

			await expect(UsersService.getProfile(mockUser.id)).rejects.toThrow(NotFoundError);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockUser.id });
		});
	});

	describe("updateProfile", () => {
		const updateData: UpdateUserProfileRequestBodyDto = {
			email: mockUser.email,
			username: mockUser.username,
		};

		it("should return updated user", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "updateOne")
				.mockResolvedValue(mockUser);

			const result = await UsersService.updateProfile(updateData, mockUser.id);

			expect(result).toEqual(mockUser);
			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateData, mockUser.id);
		});

		it("should throw NotFoundError if user is not found", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "updateOne")
				.mockResolvedValue(null);

			await expect(UsersService.updateProfile(updateData, mockUser.id)).rejects.toThrow(
				NotFoundError
			);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateData, mockUser.id);
		});
	});

	describe("updatePassword", () => {
		const updatePasswordData: UpdateUserPasswordRequestBodyDto = {
			currentPassword: "123123123",
			newPassword: "newpassword",
		};

		it("should throw NotFoundError if user is not found", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneById")
				.mockResolvedValue(null);

			await expect(
				UsersService.updatePassword(updatePasswordData, mockUser.id)
			).rejects.toThrow(NotFoundError);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockUser.id });
		});

		it("should throw UnauthorizedError if password is incorrect", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneById")
				.mockResolvedValue(mockUser);

			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(
				UsersService.updatePassword(updatePasswordData, mockUser.id)
			).rejects.toThrow(UnauthorizedError);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith({ id: mockUser.id });
		});

		it("should throw NotFoundError if user is not found when updating", async () => {
			const getOneByIdSpy = jest
				.spyOn(UsersRepository, "getOneById")
				.mockResolvedValue(mockUser);

			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(bcrypt.genSalt as jest.Mock).mockResolvedValue("Salt");
			(bcrypt.hash as jest.Mock).mockResolvedValue(updatePasswordData.newPassword);

			const updateOneSpy = jest
				.spyOn(UsersRepository, "updateOne")
				.mockResolvedValue(null);

			await expect(
				UsersService.updatePassword(updatePasswordData, mockUser.id)
			).rejects.toThrow(NotFoundError);

			expect(getOneByIdSpy).toHaveBeenCalledTimes(1);
			expect(getOneByIdSpy).toHaveBeenLastCalledWith({ id: mockUser.id });

			expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
			expect(bcrypt.hash).toHaveBeenCalledWith(updatePasswordData.newPassword, "Salt");

			expect(updateOneSpy).toHaveBeenCalledTimes(1);
			expect(updateOneSpy).toHaveBeenCalledWith(
				{ password: updatePasswordData.newPassword },
				mockUser.id
			);
		});

		it("should update user password", async () => {
			const getOneByIdSpy = jest
				.spyOn(UsersRepository, "getOneById")
				.mockResolvedValue(mockUser);

			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(bcrypt.genSalt as jest.Mock).mockResolvedValue("Salt");
			(bcrypt.hash as jest.Mock).mockResolvedValue(updatePasswordData.newPassword);

			const updateOneSpy = jest
				.spyOn(UsersRepository, "updateOne")
				.mockResolvedValue(mockUser);

			await expect(
				UsersService.updatePassword(updatePasswordData, mockUser.id)
			).resolves.toBeUndefined();

			expect(getOneByIdSpy).toHaveBeenCalledTimes(1);
			expect(getOneByIdSpy).toHaveBeenLastCalledWith({ id: mockUser.id });

			expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
			expect(bcrypt.hash).toHaveBeenCalledWith(updatePasswordData.newPassword, "Salt");

			expect(updateOneSpy).toHaveBeenCalledTimes(1);
			expect(updateOneSpy).toHaveBeenCalledWith(
				{ password: updatePasswordData.newPassword },
				mockUser.id
			);
		});
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

			await expect(
				UsersService.updateUserRole(updateUserRoleData, mockUser.id)
			).rejects.toThrow(NotFoundError);

			expect(repositorySpy).toHaveBeenCalledTimes(1);
			expect(repositorySpy).toHaveBeenLastCalledWith(updateUserRoleData, mockUser.id);
		});
	});
});
