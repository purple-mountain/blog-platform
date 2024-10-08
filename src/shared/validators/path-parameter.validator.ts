import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export function validatePathParameter(
	param: string,
	paramSchema: z.ZodType<string, any>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const pathParam = req.params[param];
			paramSchema.parse(pathParam);
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
				errors: ["Invalid Path Parameter"],
			});
		}
	};
}
