import { CustomError } from "#/shared/errors/custom-error";

export class BadRequestError extends CustomError {
	constructor(message: string) {
		super({ message, statusCode: 400 });
	}
}
