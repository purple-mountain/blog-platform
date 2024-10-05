export type UserModel = {
	id: string;
	email: string;
	username: string;
	password: string;
	role: "admin" | "user";
	createdAt: string;
};
