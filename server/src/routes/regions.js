import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Получить все регионы (публично)
router.get("/", async (req, res) => {
	try {
		const regions = await dbAll("SELECT * FROM regions ORDER BY name ASC");
		res.json({ regions });
	} catch (err) {
		console.error("Get regions error:", err);
		res.status(500).json({ error: "Ошибка загрузки регионов" });
	}
});

// Получить один регион
router.get("/:name", async (req, res) => {
	try {
		const region = await dbGet("SELECT * FROM regions WHERE name = ?", [req.params.name]);
		if (!region) return res.status(404).json({ error: "Регион не найден" });
		res.json({ region });
	} catch (err) {
		console.error("Get region error:", err);
		res.status(500).json({ error: "Ошибка загрузки региона" });
	}
});

// CRUD для админа
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { name, title, description, video_url, coords } = req.body;
		await dbRun(
			"INSERT INTO regions (name, title, description, video_url, coords) VALUES (?, ?, ?, ?, ?)",
			[name, title, description, video_url || "", coords || ""],
		);
		res.status(201).json({ message: "Регион создан" });
	} catch (err) {
		console.error("Create region error:", err);
		res.status(500).json({ error: "Ошибка создания региона" });
	}
});

router.put("/:name", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { title, description, video_url, coords } = req.body;
		await dbRun(
			"UPDATE regions SET title = ?, description = ?, video_url = ?, coords = ? WHERE name = ?",
			[title, description, video_url || "", coords || "", req.params.name],
		);
		res.json({ message: "Регион обновлён" });
	} catch (err) {
		console.error("Update region error:", err);
		res.status(500).json({ error: "Ошибка обновления региона" });
	}
});

router.delete("/:name", authenticate, requireRole("admin"), async (req, res) => {
	try {
		await dbRun("DELETE FROM regions WHERE name = ?", [req.params.name]);
		res.json({ message: "Регион удалён" });
	} catch (err) {
		console.error("Delete region error:", err);
		res.status(500).json({ error: "Ошибка удаления региона" });
	}
});

export default router;