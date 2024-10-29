import { AuthService } from "../auth.service";
import { UsersRepository } from "#/modules/users/users.repository";
import { UnauthorizedError } from "#/shared/errors/unauthorized.error";
import bcrypt from "bcrypt";
import { generateJwtToken } from "#/shared/utils/generate-token";
import { BadRequestError } from "#/shared/errors/bad-request.error";
import { User } from "#/modules/users/entities/user.entity";
import { UserRole } from "#/shared/constants/user-role.constant";
import { envConfig } from "#/config/env.config";

jest.mock("#/shared/utils/generate-token");
jest.mock("bcrypt");

const mockUser: User | null = {
	id: "1",
	email: "davranbek@example.com",
	username: "davranbek",
	password: "123123123",
	role: UserRole.USER,
	createdAt: new Date(),
};

describe("AuthService", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("login", () => {
		const loginData = { email: "davranbek@example.com", password: "123123123" };

		it("should throw UnauthorizedError if user does not exist", async () => {
			jest.spyOn(UsersRepository, "getOneByEmail").mockResolvedValue(null);

			expect(AuthService.login(loginData)).rejects.toThrow(UnauthorizedError);
		});

		it("should throw UnauthorizedError if password is incorrect", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneByEmail")
				.mockResolvedValue(mockUser);

			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			expect(AuthService.login(loginData)).rejects.toThrow(UnauthorizedError);
			expect(repositorySpy).toHaveBeenCalledWith({ email: loginData.email });
		});

		it("should return user and tokens if login is successful", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneByEmail")
				.mockResolvedValue(mockUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);

			(generateJwtToken as jest.Mock)
				.mockReturnValueOnce("accessTokenMock")
				.mockReturnValueOnce("refreshTokenMock");

			const result = await AuthService.login(loginData);

			expect(result.user).toEqual(mockUser);
			expect(result.accessToken).toBe("accessTokenMock");
			expect(result.refreshToken).toBe("refreshTokenMock");

			expect(repositorySpy).toHaveBeenCalledWith({
				email: loginData.email,
			});

			expect(generateJwtToken).toHaveBeenCalledTimes(2);
			expect(generateJwtToken).toHaveBeenCalledWith(
				envConfig.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
				{ userId: mockUser.id }
			);
			expect(generateJwtToken).toHaveBeenCalledWith(
				envConfig.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
				{ userId: mockUser.id }
			);
		});
	});

	describe("signUp", () => {
		const signUpData = {
			email: "davranbek@example.com",
			username: "davranbek",
			password: "123123123",
		};

		it("should throw BadRequestError if user already exists", async () => {
			const repositorySpy = jest
				.spyOn(UsersRepository, "getOneByEmail")
				.mockResolvedValue(mockUser);

			expect(AuthService.signUp(signUpData)).rejects.toThrow(BadRequestError);
			expect(repositorySpy).toHaveBeenCalledWith({ email: signUpData.email });
		});

		it("should return new user and access and refresh tokens if sign up is successful", async () => {
			const getUserRepositorySpy = jest
				.spyOn(UsersRepository, "getOneByEmail")
				.mockResolvedValue(null);

			(bcrypt.genSalt as jest.Mock).mockResolvedValue("Salt");
			(bcrypt.hash as jest.Mock).mockResolvedValue("123123123");

			const createUserRepositorySpy = jest
				.spyOn(UsersRepository, "createOne")
				.mockResolvedValue(mockUser);

			(generateJwtToken as jest.Mock)
				.mockReturnValueOnce("accessTokenMock")
				.mockReturnValueOnce("refreshTokenMock");

			const result = await AuthService.signUp(signUpData);

			expect(result.newUser).toEqual(mockUser);
			expect(result.accessToken).toEqual("accessTokenMock");
			expect(result.refreshToken).toEqual("refreshTokenMock");

			expect(getUserRepositorySpy).toHaveBeenCalledWith({ email: signUpData.email });
			expect(createUserRepositorySpy).toHaveBeenCalledWith(signUpData);

			expect(generateJwtToken).toHaveBeenCalledTimes(2);
			expect(generateJwtToken).toHaveBeenCalledWith(
				envConfig.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
				{ userId: mockUser.id }
			);
			expect(generateJwtToken).toHaveBeenCalledWith(
				envConfig.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
				{ userId: mockUser.id }
			);

			expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
			expect(bcrypt.hash).toHaveBeenCalledWith(signUpData.password, "Salt");
		});
	});
});
