import { Router } from "express";
import { dbAll, dbGet } from "../db/db.js";

const router = Router();

// Get places (accommodation, dining, entertainment)
router.get("/", async (req, res) => {
	try {
		const { type, region } = req.query;

		let sql = "SELECT * FROM places WHERE is_active = 1";
		const params = [];

		if (type) {
			sql += " AND type = ?";
			params.push(type);
		}

		if (region) {
			sql += " AND region = ?";
			params.push(region);
		}

		sql += " ORDER BY type, name";

		const places = await dbAll(sql, params);

		res.json({ places });
	} catch (err) {
		console.error("Get places error:", err);
		res.status(500).json({ error: "Ошибка загрузки мест" });
	}
});

// Get place types
router.get("/types", async (req, res) => {
	try {
		const types = await dbAll("SELECT DISTINCT type FROM places ORDER BY type");
		res.json({ types: types.map((t) => t.type) });
	} catch (err) {
		console.error("Get place types error:", err);
		res.status(500).json({ error: "Ошибка загрузки типов мест" });
	}
});

export default router;
