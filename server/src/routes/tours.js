import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Get all tours (public)
router.get("/", optionalAuth, async (req, res) => {
	try {
		const {
			enterprise_id,
			duration,
			min_cost,
			max_cost,
			production_type,
			edu_program,
			accessibility,
			status = "published",
			limit = 50,
			offset = 0,
		} = req.query;

		let sql = `SELECT t.*, e.name as enterprise_name, e.region, e.production_type as enterprise_type
               FROM tours t
               LEFT JOIN enterprises e ON t.enterprise_id = e.id
               WHERE t.status = ?`;
		const params = [status];

		if (enterprise_id) {
			sql += " AND t.enterprise_id = ?";
			params.push(enterprise_id);
		}

		if (duration) {
			sql += " AND t.duration = ?";
			params.push(duration);
		}

		if (min_cost !== undefined) {
			sql += " AND t.cost >= ?";
			params.push(parseInt(min_cost));
		}

		if (max_cost !== undefined) {
			sql += " AND t.cost <= ?";
			params.push(parseInt(max_cost));
		}

		if (production_type) {
			sql += " AND (t.production_type = ? OR e.production_type = ?)";
			params.push(production_type, production_type);
		}

		if (edu_program) {
			sql += " AND t.edu_program = ?";
			params.push(edu_program);
		}

		sql += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
		params.push(parseInt(limit), parseInt(offset));

		const tours = await dbAll(sql, params);

		// Parse JSON fields
		const result = tours.map((t) => ({
			...t,
			tags: JSON.parse(t.tags || "[]"),
			accessibility: JSON.parse(t.accessibility || "[]"),
		}));

		res.json({ tours: result });
	} catch (err) {
		console.error("Get tours error:", err);
		res.status(500).json({ error: "Ошибка загрузки экскурсий" });
	}
});

// Get single tour
router.get("/:id", optionalAuth, async (req, res) => {
	try {
		const { id } = req.params;

		// Increment views
		await dbRun("UPDATE tours SET views_count = views_count + 1 WHERE id = ?", [
			id,
		]);

		const tour = await dbGet(
			`SELECT t.*, e.name as enterprise_name, e.region, e.address as enterprise_address,
              e.production_type as enterprise_type, e.vk_photos_url, e.vk_video_url
       FROM tours t
       LEFT JOIN enterprises e ON t.enterprise_id = e.id
       WHERE t.id = ?`,
			[id],
		);

		if (!tour) {
			return res.status(404).json({ error: "Экскурсия не найдена" });
		}

		const result = {
			...tour,
			tags: JSON.parse(tour.tags || "[]"),
			accessibility: JSON.parse(tour.accessibility || "[]"),
		};

		res.json({ tour: result });
	} catch (err) {
		console.error("Get tour error:", err);
		res.status(500).json({ error: "Ошибка загрузки экскурсии" });
	}
});

// Get filter options (for cascade filters)
router.get("/meta/filters", async (req, res) => {
	try {
		const { enterprise_id } = req.query;

		let baseCondition = 'status = "published"';
		if (enterprise_id) {
			baseCondition += ` AND enterprise_id = ${parseInt(enterprise_id)}`;
		}

		// Get all unique values for filters
		const [durations, productionTypes, eduPrograms] = await Promise.all([
			dbAll(
				`SELECT DISTINCT duration FROM tours WHERE ${baseCondition} AND duration IS NOT NULL ORDER BY duration`,
			),
			dbAll(
				`SELECT DISTINCT production_type FROM tours WHERE ${baseCondition} AND production_type IS NOT NULL ORDER BY production_type`,
			),
			dbAll(
				`SELECT DISTINCT edu_program FROM tours WHERE ${baseCondition} AND edu_program IS NOT NULL ORDER BY edu_program`,
			),
		]);

		// Cost ranges
		const costRanges = [
			{ label: "Бесплатно", min: 0, max: 0 },
			{ label: "До 500 ₽", min: 1, max: 500 },
			{ label: "500–1500 ₽", min: 500, max: 1500 },
			{ label: "1500+ ₽", min: 1500, max: 999999 },
		];

		res.json({
			durations: durations.map((d) => d.duration),
			production_types: productionTypes.map((p) => p.production_type),
			edu_programs: eduPrograms.map((e) => e.edu_program),
			cost_ranges: costRanges,
		});
	} catch (err) {
		console.error("Get filters error:", err);
		res.status(500).json({ error: "Ошибка загрузки фильтров" });
	}
});

export default router;
