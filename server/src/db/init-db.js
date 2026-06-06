import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb, dbRun } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDatabase() {
	console.log("🔄 Инициализация базы данных...");

	const schemaPath = path.join(__dirname, "schema.sql");
	const schema = fs.readFileSync(schemaPath, "utf-8");

	await getDb();

	// Split by CREATE statements first, then handle them in order
	const lines = schema.split("\n");
	let currentStatement = "";
	const statements = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.startsWith("--") || trimmed === "") continue;

		currentStatement += line + "\n";

		// End of statement
		if (trimmed.endsWith(";")) {
			const stmt = currentStatement.trim();
			if (stmt && !stmt.startsWith("--")) {
				statements.push(stmt.slice(0, -1)); // Remove trailing semicolon
			}
			currentStatement = "";
		}
	}

	// Execute tables first, then indexes
	const tables = statements.filter((s) =>
		s.toUpperCase().includes("CREATE TABLE"),
	);
	const indexes = statements.filter((s) =>
		s.toUpperCase().includes("CREATE INDEX"),
	);

	console.log(
		`📦 Найдено ${tables.length} таблиц и ${indexes.length} индексов`,
	);

	for (const table of tables) {
		try {
			await dbRun(table, []);
		} catch (err) {
			if (!err.message.includes("already exists")) {
				console.error("Table creation error:", err.message);
			}
		}
	}

	for (const index of indexes) {
		try {
			await dbRun(index, []);
		} catch (err) {
			if (!err.message.includes("already exists")) {
				console.error("Index creation error:", err.message);
			}
		}
	}

	console.log("✅ База данных инициализирована");
	return true;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	initDatabase()
		.then(() => process.exit(0))
		.catch((err) => {
			console.error("❌ Ошибка инициализации:", err);
			process.exit(1);
		});
}

export default initDatabase;
