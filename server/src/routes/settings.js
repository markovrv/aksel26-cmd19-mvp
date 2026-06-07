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

// Test AI connection (admin only)
router.post("/test-ai", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const rows = await dbAll("SELECT key, value FROM settings WHERE key IN ('llm_base_url', 'llm_api_key', 'llm_model')");
		const config = {};
		for (const row of rows) {
			config[row.key] = row.value;
		}

		if (!config.llm_api_key) {
			return res.status(400).json({ error: "Не указан ключ API для LLM" });
		}
		if (!config.llm_base_url) {
			return res.status(400).json({ error: "Не указан URL сервера LLM" });
		}

		const baseUrl = config.llm_base_url.replace(/\/+$/, "");
		const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${config.llm_api_key}`,
			},
			body: JSON.stringify({
				model: config.llm_model || "gpt-4o-mini",
				messages: [
					{ role: "user", content: "Привет" },
				],
			}),
		});

		if (!aiResponse.ok) {
			const errText = await aiResponse.text().catch(() => "");
			return res.status(400).json({ error: `Ошибка API: ${aiResponse.status} ${errText.slice(0, 200)}` });
		}

		const result = await aiResponse.json();
		const reply = result.choices?.[0]?.message?.content || "пустой ответ";
		res.json({ message: reply.trim() });
	} catch (err) {
		console.error("Test AI error:", err);
		res.status(500).json({ error: `Ошибка подключения: ${err.message}` });
	}
});

// Test VK notification (admin only)
router.post("/test-vk", authenticate, requireRole("admin"), async (req, res) => {
	try {
		// Get VK settings from DB
		const rows = await dbAll("SELECT key, value FROM settings WHERE key IN ('vk_token', 'vk_admin_peer_id')");
		const config = {};
		for (const row of rows) {
			config[row.key] = row.value;
		}

		if (!config.vk_token) {
			return res.status(400).json({ error: "Не указан токен сообщества VK" });
		}
		if (!config.vk_admin_peer_id) {
			return res.status(400).json({ error: "Не указан ID администратора VK" });
		}

		// Send test message via VK API
		const vkResponse = await fetch("https://api.vk.com/method/messages.send", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				access_token: config.vk_token,
				v: "5.199",
				peer_id: config.vk_admin_peer_id,
				message: "🔔 Тестовое уведомление от ПромОриентир.\n\nЕсли вы видите это сообщение — настройки VK работают корректно.",
				random_id: Math.floor(Math.random() * 1000000),
			}),
		});

		const result = await vkResponse.json();

		if (result.error) {
			console.error("VK API error:", result.error);
			return res.status(400).json({ error: `Ошибка VK API: ${result.error.error_msg || result.error.message}` });
		}

		res.json({ message: "Тестовое сообщение отправлено успешно", response: result });
	} catch (err) {
		console.error("Test VK error:", err);
		res.status(500).json({ error: "Ошибка отправки тестового сообщения" });
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
