import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Create booking (public)
router.post("/", async (req, res) => {
	try {
		const {
			tour_id,
			full_name,
			email,
			phone,
			group_size,
			desired_date,
			special_needs,
			accessibility_needs = [],
			tb_accepted,
		} = req.body;

		if (!tour_id || !full_name || !email || !group_size || !tb_accepted) {
			return res.status(400).json({ error: "Заполните обязательные поля" });
		}

		// Validate tour exists
		const tour = await dbGet(
			'SELECT * FROM tours WHERE id = ? AND status = "published"',
			[tour_id],
		);
		if (!tour) {
			return res.status(404).json({ error: "Экскурсия не найдена" });
		}

		const result = await dbRun(
			`INSERT INTO bookings (tour_id, full_name, email, phone, group_size, desired_date, 
       special_needs, accessibility_needs, tb_accepted, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
			[
				tour_id,
				full_name,
				email,
				phone || null,
				group_size,
				desired_date || null,
				special_needs || null,
				JSON.stringify(accessibility_needs),
				tb_accepted ? 1 : 0,
			],
		);

		// Send VK notification about new booking
		const { sendVkNotify } = await import("../utils/vkNotify.js");
		const tourInfo = tour.title || `экскурсия #${tour_id}`;
		await sendVkNotify(
			`📩 Новая заявка на экскурсию!\n\n👤 ${full_name}\n📧 ${email}\n📱 ${phone || "—"}\n🎫 ${tourInfo}\n👥 ${group_size} чел.\n📅 ${desired_date || "не указана"}\n\nСтатус: Новая (ожидает рассмотрения)`,
		);

		res.status(201).json({
			message: "Заявка успешно отправлена",
			booking_id: result.lastID,
		});
	} catch (err) {
		console.error("Create booking error:", err);
		res.status(500).json({ error: "Ошибка создания заявки" });
	}
});

// Get user's bookings
router.get("/", authenticate, async (req, res) => {
	try {
		const bookings = await dbAll(
			`SELECT b.*, t.title as tour_title, t.duration, t.cost,
              e.name as enterprise_name
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.id
       LEFT JOIN enterprises e ON t.enterprise_id = e.id
       WHERE b.user_id = ? OR b.email = ?
       ORDER BY b.created_at DESC`,
			[req.user.id, req.user.email],
		);

		res.json({ bookings });
	} catch (err) {
		console.error("Get bookings error:", err);
		res.status(500).json({ error: "Ошибка загрузки заявок" });
	}
});

// Update booking status (enterprise or admin)
router.patch("/:id/status", authenticate, async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		const validStatuses = [
			"new",
			"reviewing",
			"confirmed",
			"rejected",
			"cancelled",
		];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: "Недопустимый статус" });
		}

		const booking = await dbGet("SELECT * FROM bookings WHERE id = ?", [id]);
		if (!booking) {
			return res.status(404).json({ error: "Заявка не найдена" });
		}

		// Check permission
		if (req.user.role === "enterprise") {
			const tour = await dbGet("SELECT enterprise_id FROM tours WHERE id = ?", [
				booking.tour_id,
			]);
			const enterprise = await dbGet(
				"SELECT user_id FROM enterprises WHERE id = ?",
				[tour?.enterprise_id],
			);

			if (enterprise?.user_id !== req.user.id) {
				return res.status(403).json({ error: "Недостаточно прав" });
			}
		} else if (req.user.role !== "admin") {
			return res.status(403).json({ error: "Недостаточно прав" });
		}

		await dbRun(
			"UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
			[status, id],
		);

		// TODO: Send VK notification to user if they have VK ID

		res.json({ message: "Статус обновлён" });
	} catch (err) {
		console.error("Update booking status error:", err);
		res.status(500).json({ error: "Ошибка обновления статуса" });
	}
});

export default router;
