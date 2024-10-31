import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/unauthorized.error";
import { EntityTarget, FindOptionsWhere } from "typeorm";
import { db } from "#/database/database";

type ResourceEntity =
	| { id: string; author: { id: string }; user?: never }
	| { id: string; user: { id: string }; author?: never };

export function checkResourceOwnership<T extends ResourceEntity>(
	entity: EntityTarget<T>,
	options?: { allowAdmin: boolean }
) {
	return (req: Request, _res: Response, next: NextFunction) => {
		const resourceId = req.params["id"] || "";
		const repository = db.getDataSource().getRepository(entity);
		const whereQuery = { id: resourceId } as FindOptionsWhere<T>;

		repository
			.findOne({
				where: whereQuery,
				relations: ["author"],
			})
			.catch(() => {
				return repository.findOne({
					where: whereQuery,
					relations: ["user"],
				});
			})
			.then((resource) => {
				if (!resource) {
					throw new UnauthorizedError("Resource not found");
				}

				const resourceAuthorId = resource.author?.id || resource.user?.id;

				if (
					resourceAuthorId === req.user.id ||
					(options?.allowAdmin && req.user.role === "admin")
				) {
					next();
				} else {
					throw new UnauthorizedError("You are not authorized to perform this action");
				}
			})
			.catch((error) => {
				next(error);
			});
	};
}
