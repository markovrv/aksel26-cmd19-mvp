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
			} = req.body;

			const result = await dbRun(
				`INSERT INTO enterprises (name, region, address, production_type, description, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
				[name, region, address, production_type, description, status],
			);

			res.status(201).json({ id: result.lastID });
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
			const { name, region, address, production_type, description, status } =
				req.body;

			await dbRun(
				`UPDATE enterprises SET name = ?, region = ?, address = ?, production_type = ?,
       description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
				[name, region, address, production_type, description, status, id],
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

// CRUD for tours (admin only)
router.post("/tours", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const {
			enterprise_id,
			title,
			description,
			duration,
			cost,
			status = "draft",
		} = req.body;

		const result = await dbRun(
			`INSERT INTO tours (enterprise_id, title, description, duration, cost, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[enterprise_id, title, description, duration, cost, status],
		);

		res.status(201).json({ id: result.lastID });
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
			const { title, description, duration, cost, status } = req.body;

			await dbRun(
				`UPDATE tours SET title = ?, description = ?, duration = ?, cost = ?, status = ?,
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
				[title, description, duration, cost, status, id],
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
