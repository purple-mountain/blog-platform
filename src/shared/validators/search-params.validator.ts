import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export function validateSearchParams(schema: z.ZodObject<any, any>) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const requestSearchParams = req.query;
			const parsedValues = schema.parse(requestSearchParams);
			req.query = parsedValues;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((error) => error.message);

				return res.status(400).json({
					message: "Bad Request",
					errors: errorMessages,
				});
			}

			return res.status(400).json({
				message: "Bad Request",
				errors: ["Invalid search params"],
			});
		}
	};
}
