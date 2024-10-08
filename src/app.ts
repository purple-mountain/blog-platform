import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "#/database/database";
import { Request, Response } from "express";
import { AuthController } from "#/modules/auth/auth.controller";
import { BlogsController } from "./modules/blogs/blogs.controller";
import { notFoundMiddleware } from "#/shared/middlewares/not-found.middleware";
import { errorMiddleware } from "#/shared/middlewares/error.middleware";
import { auth } from "./shared/middlewares/auth.middleware";

export const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("/", auth, (_req: Request, res: Response) => {
	return res.status(200).json({ message: "Hello, World" });
});

app.get("/health", async (_req: Request, res: Response) => {
	const result = await db.execute("SELECT 1");
	return res.status(200).json({ message: result });
});

app.use("/auth", AuthController);
app.use("/blogs", BlogsController);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
