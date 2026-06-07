import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

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

// Create place (admin only)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { name, type, address, site_url, vk_url, region } = req.body;
		if (!name || !type) {
			return res.status(400).json({ error: "Название и тип обязательны" });
		}
		const result = await dbRun(
			"INSERT INTO places (name, type, address, site_url, vk_url, region) VALUES (?, ?, ?, ?, ?, ?)",
			[name, type, address || "", site_url || "", vk_url || "", region || ""],
		);
		res.status(201).json({ id: result.lastID, message: "Место создано" });
	} catch (err) {
		console.error("Create place error:", err);
		res.status(500).json({ error: "Ошибка создания места" });
	}
});

// Update place (admin only)
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { name, type, address, site_url, vk_url, region } = req.body;
		await dbRun(
			"UPDATE places SET name = ?, type = ?, address = ?, site_url = ?, vk_url = ?, region = ? WHERE id = ?",
			[name, type, address || "", site_url || "", vk_url || "", region || "", req.params.id],
		);
		res.json({ message: "Место обновлено" });
	} catch (err) {
		console.error("Update place error:", err);
		res.status(500).json({ error: "Ошибка обновления места" });
	}
});

// Delete place (admin only)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
	try {
		await dbRun("UPDATE places SET is_active = 0 WHERE id = ?", [req.params.id]);
		res.json({ message: "Место удалено" });
	} catch (err) {
		console.error("Delete place error:", err);
		res.status(500).json({ error: "Ошибка удаления места" });
	}
});

export default router;
