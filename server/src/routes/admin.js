import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Get all users (admin only)
router.get("/users", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const users = await dbAll(
			"SELECT id, email, role, name, is_active, created_at FROM users ORDER BY created_at DESC",
		);
		res.json({ users });
	} catch (err) {
		console.error("Get users error:", err);
		res.status(500).json({ error: "Ошибка загрузки пользователей" });
	}
});

// Update user (admin only)
router.patch(
	"/users/:id",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { id } = req.params;
			const { role, is_active } = req.body;

			await dbRun(
				"UPDATE users SET role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
				[role, is_active ? 1 : 0, id],
			);

			res.json({ message: "Пользователь обновлён" });
		} catch (err) {
			console.error("Update user error:", err);
			res.status(500).json({ error: "Ошибка обновления пользователя" });
		}
	},
);

// Get all bookings (admin only)
router.get(
	"/bookings",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const bookings = await dbAll(`
      SELECT b.*, t.title as tour_title, e.name as enterprise_name
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN enterprises e ON t.enterprise_id = e.id
      ORDER BY b.created_at DESC
    `);
			res.json({ bookings });
		} catch (err) {
			console.error("Get all bookings error:", err);
			res.status(500).json({ error: "Ошибка загрузки заявок" });
		}
	},
);

// Update booking (admin only)
router.patch(
	"/bookings/:id",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
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

			await dbRun(
				"UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
				[status, id],
			);

			res.json({ message: "Заявка обновлена" });
		} catch (err) {
			console.error("Update booking error:", err);
			res.status(500).json({ error: "Ошибка обновления заявки" });
		}
	},
);

// CRUD for enterprises (admin only)
router.post(
	"/enterprises",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const {
				name,
				region,
				address,
				production_type,
				description,
				status = "draft",
				owner_email,
				owner_password,
			} = req.body;

			// Create user with enterprise role if email provided
			let userId = null;
			if (owner_email) {
				const existing = await dbGet("SELECT id FROM users WHERE email = ?", [owner_email]);
				if (existing) {
					userId = existing.id;
				} else {
					const bcrypt = await import("bcrypt");
					const passwordHash = await bcrypt.hash(owner_password || "enterprise123", 12);
					const userResult = await dbRun(
						"INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, 'enterprise', ?)",
						[owner_email, passwordHash, name || ""],
					);
					userId = userResult.lastID;
				}
			}

			const result = await dbRun(
				`INSERT INTO enterprises (user_id, name, region, address, production_type, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[userId, name, region, address, production_type, description, status],
			);

			res.status(201).json({ id: result.lastID, user_id: userId });
		} catch (err) {
			console.error("Create enterprise error:", err);
			res.status(500).json({ error: "Ошибка создания предприятия" });
		}
	},
);

router.put(
	"/enterprises/:id",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { id } = req.params;
			const {
				name, region, address, production_type, description,
				site_url, vk_group_url, vk_photos_url, vk_video_url,
				has_360, has_ar, panorama_url, coords,
				certifications, live_stats, souvenirs, professions, tags,
				status,
			} = req.body;

			await dbRun(
				`UPDATE enterprises SET
					name = ?, region = ?, address = ?, production_type = ?, description = ?,
					site_url = ?, vk_group_url = ?, vk_photos_url = ?, vk_video_url = ?,
					has_360 = ?, has_ar = ?, panorama_url = ?, coords = ?,
					certifications = ?, live_stats = ?, souvenirs = ?, professions = ?, tags = ?,
					status = ?, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?`,
				[
					name, region, address, production_type, description,
					site_url || "", vk_group_url || "", vk_photos_url || "", vk_video_url || "",
					has_360 ? 1 : 0, has_ar ? 1 : 0, panorama_url || "", coords || "",
					JSON.stringify(certifications || []),
					JSON.stringify(live_stats || {}),
					JSON.stringify(souvenirs || []),
					JSON.stringify(professions || []),
					JSON.stringify(tags || []),
					status || "draft",
					id,
				],
			);

			res.json({ message: "Предприятие обновлено" });
		} catch (err) {
			console.error("Update enterprise error:", err);
			res.status(500).json({ error: "Ошибка обновления предприятия" });
		}
	},
);

router.delete(
	"/enterprises/:id",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { id } = req.params;
			await dbRun("DELETE FROM enterprises WHERE id = ?", [id]);
			res.json({ message: "Предприятие удалено" });
		} catch (err) {
			console.error("Delete enterprise error:", err);
			res.status(500).json({ error: "Ошибка удаления предприятия" });
		}
	},
);

// Get all tours (admin only)
router.get("/tours", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const tours = await dbAll(`
			SELECT t.*, e.name as enterprise_name
			FROM tours t
			LEFT JOIN enterprises e ON t.enterprise_id = e.id
			ORDER BY t.created_at DESC
		`);
		res.json({ tours: tours.map((t) => ({
			...t,
			tags: JSON.parse(t.tags || "[]"),
			accessibility: JSON.parse(t.accessibility || "[]"),
		})) });
	} catch (err) {
		console.error("Get all tours error:", err);
		res.status(500).json({ error: "Ошибка загрузки экскурсий" });
	}
});

// CRUD for tours (admin only)
router.post("/tours", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const {
			enterprise_id, title, description, duration, cost, max_group_size, min_age,
			production_type, edu_program, accessibility, route_image_url,
			safety_instructions, group_requirements, interactivity_level, physical_load,
			ppe_required, food_on_site, has_souvenirs, has_degustation, has_photo_spots,
			tags, contact_email, status = "draft",
		} = req.body;

		const result = await dbRun(
			`INSERT INTO tours (
				enterprise_id, title, description, duration, cost, max_group_size, min_age,
				production_type, edu_program, accessibility, route_image_url,
				safety_instructions, group_requirements, interactivity_level, physical_load,
				ppe_required, food_on_site, has_souvenirs, has_degustation, has_photo_spots,
				tags, contact_email, status
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				enterprise_id, title, description, duration, cost || 0, max_group_size || 20, min_age || "6plus",
				production_type || "", edu_program || "",
				JSON.stringify(accessibility || []), route_image_url || "",
				safety_instructions || "", group_requirements || "",
				interactivity_level || 5, physical_load || 5,
				ppe_required ? 1 : 0, food_on_site ? 1 : 0, has_souvenirs ? 1 : 0, has_degustation ? 1 : 0, has_photo_spots ? 1 : 0,
				JSON.stringify(tags || []), contact_email || "", status,
			],
		);

		res.status(201).json({ id: result.lastID, message: "Экскурсия создана" });
	} catch (err) {
		console.error("Create tour error:", err);
		res.status(500).json({ error: "Ошибка создания экскурсии" });
	}
});

router.put(
	"/tours/:id",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { id } = req.params;
			const {
				enterprise_id, title, description, duration, cost, max_group_size, min_age,
				production_type, edu_program, accessibility, route_image_url,
				safety_instructions, group_requirements, interactivity_level, physical_load,
				ppe_required, food_on_site, has_souvenirs, has_degustation, has_photo_spots,
				tags, contact_email, status,
			} = req.body;

			await dbRun(
				`UPDATE tours SET
					enterprise_id = ?, title = ?, description = ?, duration = ?, cost = ?, max_group_size = ?, min_age = ?,
					production_type = ?, edu_program = ?, accessibility = ?, route_image_url = ?,
					safety_instructions = ?, group_requirements = ?, interactivity_level = ?, physical_load = ?,
					ppe_required = ?, food_on_site = ?, has_souvenirs = ?, has_degustation = ?, has_photo_spots = ?,
					tags = ?, contact_email = ?, status = ?,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ?`,
				[
					enterprise_id, title, description, duration, cost || 0, max_group_size || 20, min_age || "6plus",
					production_type || "", edu_program || "",
					JSON.stringify(accessibility || []), route_image_url || "",
					safety_instructions || "", group_requirements || "",
					interactivity_level || 5, physical_load || 5,
					ppe_required ? 1 : 0, food_on_site ? 1 : 0, has_souvenirs ? 1 : 0, has_degustation ? 1 : 0, has_photo_spots ? 1 : 0,
					JSON.stringify(tags || []), contact_email || "", status || "draft",
					id,
				],
			);

			res.json({ message: "Экскурсия обновлена" });
		} catch (err) {
			console.error("Update tour error:", err);
			res.status(500).json({ error: "Ошибка обновления экскурсии" });
		}
	},
);

router.delete(
	"/tours/:id",
	authenticate,
	requireRole("admin"),
	async (req, res) => {
		try {
			const { id } = req.params;
			await dbRun("DELETE FROM tours WHERE id = ?", [id]);
			res.json({ message: "Экскурсия удалена" });
		} catch (err) {
			console.error("Delete tour error:", err);
			res.status(500).json({ error: "Ошибка удаления экскурсии" });
		}
	},
);

export default router;
