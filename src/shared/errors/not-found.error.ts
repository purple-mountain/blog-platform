import { CustomError } from "#/shared/errors/custom.error";

export class NotFoundError extends CustomError {
	constructor(message: string) {
		super({ message, statusCode: 404 });
	}
}
