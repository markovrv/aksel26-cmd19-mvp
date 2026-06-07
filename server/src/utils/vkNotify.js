import { dbAll } from "../db/db.js";

/**
 * Send VK notification to admin
 * @param {string} message - Message text to send
 */
export async function sendVkNotify(message) {
	try {
		const rows = await dbAll(
			"SELECT key, value FROM settings WHERE key IN ('vk_token', 'vk_admin_peer_id')",
		);
		const config = {};
		for (const row of rows) {
			config[row.key] = row.value;
		}

		if (!config.vk_token || !config.vk_admin_peer_id) {
			console.log("⚠️ VK notification skipped: no token or peer_id configured");
			return;
		}

		const response = await fetch("https://api.vk.com/method/messages.send", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				access_token: config.vk_token,
				v: "5.199",
				peer_id: config.vk_admin_peer_id,
				message: message,
				random_id: Math.floor(Math.random() * 1000000),
			}),
		});

		const result = await response.json();
		if (result.error) {
			console.error("VK API error:", result.error);
		} else {
			console.log("✅ VK notification sent");
		}
	} catch (err) {
		console.error("VK notify error:", err);
	}
}