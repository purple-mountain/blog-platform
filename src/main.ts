import { app } from "#/app";
import { db } from "#/database/database";

async function main() {
	await db.init();

	app.listen(3000, () => {
		console.log(`Server is running on http://localhost:3000`);
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
