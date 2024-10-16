import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/unauthorized.error";
import { UserRole } from "../constants/user-role.constant";

export function requireRole(requiredRole: UserRole) {
	return (req: Request, _res: Response, next: NextFunction) => {
		const currentRole = req?.user.role;

		if (!currentRole) {
			throw new UnauthorizedError("Unauthorized");
		}

		if (currentRole !== requiredRole) {
			throw new UnauthorizedError(
				"You do not have the required role to access this resource"
			);
		}

		next();
	};
}
