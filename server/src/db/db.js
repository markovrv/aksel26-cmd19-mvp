import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH =
	process.env.NODE_ENV === "production"
		? "/app/server/data/base.db"
		: path.join(__dirname, "../../data/base.db");

let db = null;

export async function getDb() {
	if (db) return db;

	return new Promise((resolve, reject) => {
		db = new sqlite3.Database(DB_PATH, (err) => {
			if (err) reject(err);
			else {
				db.run("PRAGMA foreign_keys = ON", (err) => {
					if (err) reject(err);
					else resolve(db);
				});
			}
		});
	});
}

export async function dbRun(sql, params = []) {
	const database = await getDb();
	return new Promise((resolve, reject) => {
		database.run(sql, params, function (err) {
			if (err) reject(err);
			else resolve({ lastID: this.lastID, changes: this.changes });
		});
	});
}

export async function dbGet(sql, params = []) {
	const database = await getDb();
	return new Promise((resolve, reject) => {
		database.get(sql, params, (err, row) => {
			if (err) reject(err);
			else resolve(row);
		});
	});
}

export async function dbAll(sql, params = []) {
	const database = await getDb();
	return new Promise((resolve, reject) => {
		database.all(sql, params, (err, rows) => {
			if (err) reject(err);
			else resolve(rows);
		});
	});
}

export default { getDb, dbRun, dbGet, dbAll };
