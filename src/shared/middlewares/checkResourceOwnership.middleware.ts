import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { DataSource, EntityTarget, FindOptionsWhere } from "typeorm";

interface ResourceEntity {
	id: string;
	author: { id: string };
}

export function checkResourceOwnership<T extends ResourceEntity>(
	entity: EntityTarget<T>,
	dataSource: DataSource,
	allowAdmin: boolean
) {
	return (req: Request, res: Response, next: NextFunction) => {
		const resourceId = req.params["id"] || "";
		const repository = dataSource.getRepository(entity);
		const whereQuery = { id: resourceId } as FindOptionsWhere<T>;

		// express does not allow async middlewares
		// so i am using promise chaining
		repository
			.findOne({
				where: whereQuery,
				relations: ["author"],
			})
			.then((resource) => {
				if (!resource) {
					throw new UnauthorizedError("Resource not found");
				}
				if (
					resource.author.id === req.user.id ||
					(allowAdmin && req.user.role === "admin")
				) {
					next();
				} else {
					throw new UnauthorizedError("You are not authorized to perform this action");
				}
			})
			.catch((error) => {
				console.error(error);
				next(error);
			});
	};
}
