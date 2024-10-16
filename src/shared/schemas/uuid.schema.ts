import { z } from "zod";

export const uuidSchema = z.string().uuid({ message: "ID is not a valid uuid" });
