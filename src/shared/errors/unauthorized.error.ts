import { CustomError } from "#/shared/errors/custom.error";

export class UnauthorizedError extends CustomError {
	constructor(message: string) {
		super({ message, statusCode: 401 });
	}
}
