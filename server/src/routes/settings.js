import { Router } from "express";
import { dbAll, dbRun } from "../db/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Get all settings (admin only)
router.get("/", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const settings = await dbAll(
			"SELECT key, value, updated_at FROM settings ORDER BY key",
		);
		res.json({ settings });
	} catch (err) {
		console.error("Get settings error:", err);
		res.status(500).json({ error: "Ошибка загрузки настроек" });
	}
});

// Update settings (admin only)
router.put("/", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const settings = req.body;

		for (const [key, value] of Object.entries(settings)) {
			await dbRun(
				"INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
				[key, value],
			);
		}

		res.json({ message: "Настройки сохранены" });
	} catch (err) {
		console.error("Update settings error:", err);
		res.status(500).json({ error: "Ошибка сохранения настроек" });
	}
});

// Get single setting (admin only)
router.get("/:key", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { key } = req.params;
		const setting = await dbAll("SELECT value FROM settings WHERE key = ?", [
			key,
		]);
		res.json({ value: setting[0]?.value || null });
	} catch (err) {
		console.error("Get setting error:", err);
		res.status(500).json({ error: "Ошибка загрузки настройки" });
	}
});

export default router;
