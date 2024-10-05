import { Request, Response, NextFunction } from "express";
import { CustomError } from "#/shared/errors/custom-error";

/* eslint-disable */
export function errorMiddleware(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	/* eslint-enable */
	if (err instanceof CustomError) {
		return res.status(err.statusCode).json({ message: err.message });
	}

	res.status(500).json({
		message: "Internal Server Error",
	});
}
