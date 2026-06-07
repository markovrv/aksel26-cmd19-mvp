import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../data/base.db");

if (fs.existsSync(dbPath)) {
	fs.unlinkSync(dbPath);
	console.log("🗑️ База данных удалена");
} else {
	console.log("ℹ️ База данных не найдена");
}