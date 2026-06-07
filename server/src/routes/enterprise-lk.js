import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Все маршруты требуют аутентификации и роли enterprise или admin
const enterpriseAccess = [authenticate, requireRole("enterprise", "admin")];

// Получить профиль предприятия текущего пользователя
router.get("/profile", ...enterpriseAccess, async (req, res) => {
	try {
		const enterprise = await dbGet(
			`SELECT e.* FROM enterprises e WHERE e.user_id = ?`,
			[req.user.id],
		);
		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}
		res.json({
			enterprise: {
				...enterprise,
				certifications: JSON.parse(enterprise.certifications || "[]"),
				live_stats: JSON.parse(enterprise.live_stats || "{}"),
				souvenirs: JSON.parse(enterprise.souvenirs || "[]"),
				professions: JSON.parse(enterprise.professions || "[]"),
				tags: JSON.parse(enterprise.tags || "[]"),
			},
		});
	} catch (err) {
		console.error("Get enterprise profile error:", err);
		res.status(500).json({ error: "Ошибка загрузки профиля" });
	}
});

// Обновить паспорт предприятия
router.put("/profile", ...enterpriseAccess, async (req, res) => {
	try {
		const {
			name, region, address, production_type, description,
			site_url, vk_group_url, vk_photos_url, vk_video_url,
			has_360, has_ar, panorama_url, coords,
			certifications, live_stats, souvenirs, professions, tags,
		} = req.body;

		await dbRun(
			`UPDATE enterprises SET
				name = ?, region = ?, address = ?, production_type = ?, description = ?,
				site_url = ?, vk_group_url = ?, vk_photos_url = ?, vk_video_url = ?,
				has_360 = ?, has_ar = ?, panorama_url = ?, coords = ?,
				certifications = ?, live_stats = ?, souvenirs = ?, professions = ?, tags = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = ?`,
			[
				name, region, address, production_type, description,
				site_url || "", vk_group_url || "", vk_photos_url || "", vk_video_url || "",
				has_360 ? 1 : 0, has_ar ? 1 : 0, panorama_url || "", coords || "",
				JSON.stringify(certifications || []),
				JSON.stringify(live_stats || {}),
				JSON.stringify(souvenirs || []),
				JSON.stringify(professions || []),
				JSON.stringify(tags || []),
				req.user.id,
			],
		);

		res.json({ message: "Профиль предприятия обновлён" });
	} catch (err) {
		console.error("Update enterprise profile error:", err);
		res.status(500).json({ error: "Ошибка обновления профиля" });
	}
});

// Получить экскурсии предприятия
router.get("/tours", ...enterpriseAccess, async (req, res) => {
	try {
		const enterprise = await dbGet(
			"SELECT id FROM enterprises WHERE user_id = ?",
			[req.user.id],
		);
		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		const tours = await dbAll(
			`SELECT t.*, e.name as enterprise_name
			 FROM tours t
			 LEFT JOIN enterprises e ON t.enterprise_id = e.id
			 WHERE t.enterprise_id = ?
			 ORDER BY t.created_at DESC`,
			[enterprise.id],
		);

		res.json({
			tours: tours.map((t) => ({
				...t,
				tags: JSON.parse(t.tags || "[]"),
				accessibility: JSON.parse(t.accessibility || "[]"),
			})),
		});
	} catch (err) {
		console.error("Get enterprise tours error:", err);
		res.status(500).json({ error: "Ошибка загрузки экскурсий" });
	}
});

// Создать экскурсию
router.post("/tours", ...enterpriseAccess, async (req, res) => {
	try {
		const enterprise = await dbGet(
			"SELECT id FROM enterprises WHERE user_id = ?",
			[req.user.id],
		);
		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		const {
			title, description, duration, cost, max_group_size, min_age,
			production_type, edu_program, accessibility, safety_instructions,
			group_requirements, interactivity_level, physical_load,
			ppe_required, food_on_site, has_souvenirs, has_degustation, has_photo_spots,
			tags, contact_email,
		} = req.body;

		const result = await dbRun(
			`INSERT INTO tours (
				enterprise_id, title, description, duration, cost, max_group_size, min_age,
				production_type, edu_program, accessibility, safety_instructions,
				group_requirements, interactivity_level, physical_load,
				ppe_required, food_on_site, has_souvenirs, has_degustation, has_photo_spots,
				tags, contact_email, status
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
			[
				enterprise.id,
				title, description, duration, cost || 0, max_group_size || 20, min_age || "6plus",
				production_type, edu_program || "",
				JSON.stringify(accessibility || []),
				safety_instructions || "", group_requirements || "",
				interactivity_level || 5, physical_load || 5,
				ppe_required ? 1 : 0, food_on_site ? 1 : 0,
				has_souvenirs ? 1 : 0, has_degustation ? 1 : 0, has_photo_spots ? 1 : 0,
				JSON.stringify(tags || []), contact_email || "",
			],
		);

		res.status(201).json({ id: result.lastID, message: "Экскурсия создана" });
	} catch (err) {
		console.error("Create tour error:", err);
		res.status(500).json({ error: "Ошибка создания экскурсии" });
	}
});

// Обновить экскурсию
router.put("/tours/:id", ...enterpriseAccess, async (req, res) => {
	try {
		const enterprise = await dbGet(
			"SELECT id FROM enterprises WHERE user_id = ?",
			[req.user.id],
		);
		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		const tour = await dbGet(
			"SELECT id FROM tours WHERE id = ? AND enterprise_id = ?",
			[req.params.id, enterprise.id],
		);
		if (!tour) {
			return res.status(404).json({ error: "Экскурсия не найдена" });
		}

		const {
			title, description, duration, cost, max_group_size, min_age,
			production_type, edu_program, accessibility, safety_instructions,
			group_requirements, interactivity_level, physical_load,
			ppe_required, food_on_site, has_souvenirs, has_degustation, has_photo_spots,
			tags, contact_email, status,
		} = req.body;

		await dbRun(
			`UPDATE tours SET
				title = ?, description = ?, duration = ?, cost = ?, max_group_size = ?, min_age = ?,
				production_type = ?, edu_program = ?, accessibility = ?, safety_instructions = ?,
				group_requirements = ?, interactivity_level = ?, physical_load = ?,
				ppe_required = ?, food_on_site = ?, has_souvenirs = ?, has_degustation = ?, has_photo_spots = ?,
				tags = ?, contact_email = ?, status = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?`,
			[
				title, description, duration, cost || 0, max_group_size || 20, min_age || "6plus",
				production_type, edu_program || "",
				JSON.stringify(accessibility || []),
				safety_instructions || "", group_requirements || "",
				interactivity_level || 5, physical_load || 5,
				ppe_required ? 1 : 0, food_on_site ? 1 : 0,
				has_souvenirs ? 1 : 0, has_degustation ? 1 : 0, has_photo_spots ? 1 : 0,
				JSON.stringify(tags || []), contact_email || "",
				status || "draft",
				req.params.id,
			],
		);

		res.json({ message: "Экскурсия обновлена" });
	} catch (err) {
		console.error("Update tour error:", err);
		res.status(500).json({ error: "Ошибка обновления экскурсии" });
	}
});

// Удалить экскурсию
router.delete("/tours/:id", ...enterpriseAccess, async (req, res) => {
	try {
		const enterprise = await dbGet(
			"SELECT id FROM enterprises WHERE user_id = ?",
			[req.user.id],
		);
		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		await dbRun(
			"DELETE FROM tours WHERE id = ? AND enterprise_id = ?",
			[req.params.id, enterprise.id],
		);

		res.json({ message: "Экскурсия удалена" });
	} catch (err) {
		console.error("Delete tour error:", err);
		res.status(500).json({ error: "Ошибка удаления экскурсии" });
	}
});

// Получить аналитику предприятия
router.get("/analytics", ...enterpriseAccess, async (req, res) => {
	try {
		const enterprise = await dbGet(
			"SELECT id, name FROM enterprises WHERE user_id = ?",
			[req.user.id],
		);
		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		const [tourStats, bookingsData, viewsData, recentBookings] = await Promise.all([
			dbAll(
				`SELECT id, title, views_count, status FROM tours WHERE enterprise_id = ? ORDER BY views_count DESC`,
				[enterprise.id],
			),
			dbGet(
				`SELECT COUNT(*) as total,
					SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
					SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new
				FROM bookings WHERE tour_id IN (SELECT id FROM tours WHERE enterprise_id = ?)`,
				[enterprise.id],
			),
			dbGet(
				`SELECT SUM(views_count) as total_views FROM tours WHERE enterprise_id = ?`,
				[enterprise.id],
			),
			dbAll(
				`SELECT b.*, t.title as tour_title
				 FROM bookings b
				 LEFT JOIN tours t ON b.tour_id = t.id
				 WHERE t.enterprise_id = ?
				 ORDER BY b.created_at DESC LIMIT 10`,
				[enterprise.id],
			),
		]);

		res.json({
			enterprise_name: enterprise.name,
			stats: {
				tours_count: tourStats.length,
				total_bookings: bookingsData?.total || 0,
				confirmed_bookings: bookingsData?.confirmed || 0,
				new_bookings: bookingsData?.new || 0,
				total_views: viewsData?.total_views || 0,
			},
			tours: tourStats,
			recent_bookings: recentBookings,
		});
	} catch (err) {
		console.error("Get enterprise analytics error:", err);
		res.status(500).json({ error: "Ошибка загрузки аналитики" });
	}
});

// Маршрут для админа: получить все предприятия (с разными статусами)
router.get("/admin/all", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { status } = req.query;
		let sql = `SELECT e.*, u.email as user_email, u.name as user_name
				   FROM enterprises e
				   LEFT JOIN users u ON e.user_id = u.id`;
		const params = [];

		if (status) {
			sql += " WHERE e.status = ?";
			params.push(status);
		}

		sql += " ORDER BY e.created_at DESC";

		const enterprises = await dbAll(sql, params);
		res.json({
			enterprises: enterprises.map((e) => ({
				...e,
				certifications: JSON.parse(e.certifications || "[]"),
				live_stats: JSON.parse(e.live_stats || "{}"),
				souvenirs: JSON.parse(e.souvenirs || "[]"),
				professions: JSON.parse(e.professions || "[]"),
				tags: JSON.parse(e.tags || "[]"),
			})),
		});
	} catch (err) {
		console.error("Get all enterprises error:", err);
		res.status(500).json({ error: "Ошибка загрузки предприятий" });
	}
});

// Маршрут для админа: изменить статус предприятия
router.patch("/admin/:id/status", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		const validStatuses = ["draft", "pending", "published", "blocked"];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: "Недопустимый статус" });
		}

		// Get enterprise info for notification
		const enterprise = await dbGet("SELECT name FROM enterprises WHERE id = ?", [id]);
		const entName = enterprise?.name || `#${id}`;

		await dbRun(
			"UPDATE enterprises SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
			[status, id],
		);

		// Send VK notification about status change
		const { sendVkNotify } = await import("../utils/vkNotify.js");
		const statusLabels = { draft: "Черновик", pending: "На модерации", published: "Опубликовано", blocked: "Заблокировано" };
		await sendVkNotify(
			`🏭 Статус предприятия изменён!\n\n📌 ${entName}\n🆕 Новый статус: ${statusLabels[status] || status}`,
		);

		res.json({ message: `Статус предприятия изменён на "${status}"` });
	} catch (err) {
		console.error("Update enterprise status error:", err);
		res.status(500).json({ error: "Ошибка обновления статуса" });
	}
});

export default router;