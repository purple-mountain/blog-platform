import express from "express";
import cors from "cors";
import { db } from "./database/database";
import { Request, Response } from "express";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	return res.status(200).json({ message: "Hello, World" });
});

app.get("/health", async (req: Request, res: Response) => {
	const result = await db.execute("SELECT 1");
	return res.status(200).json({ message: result });
});
