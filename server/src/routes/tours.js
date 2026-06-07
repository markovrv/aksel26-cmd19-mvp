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
			min_age,
			max_group_size,
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

		if (min_age) {
			sql += " AND t.min_age = ?";
			params.push(min_age);
		}

		if (max_group_size) {
			const sizes = { "1-5": [1, 5], "6-15": [6, 15], "16-30": [16, 30], "30+": [31, 999] };
			const range = sizes[max_group_size];
			if (range) {
				sql += " AND t.max_group_size >= ? AND t.max_group_size <= ?";
				params.push(range[0], range[1]);
			}
		}

		if (accessibility) {
			sql += " AND t.accessibility LIKE ?";
			params.push(`%"${accessibility}"%`);
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

		let baseCondition = 't.status = "published"';
		const params = [];

		if (enterprise_id) {
			baseCondition += ` AND t.enterprise_id = ?`;
			params.push(parseInt(enterprise_id));
		}

		// Get all unique values for filters
		const [durations, productionTypes, eduPrograms] = await Promise.all([
			dbAll(
				`SELECT DISTINCT t.duration FROM tours t LEFT JOIN enterprises e ON t.enterprise_id = e.id WHERE ${baseCondition} AND t.duration IS NOT NULL ORDER BY t.duration`,
				params,
			),
			dbAll(
				`SELECT DISTINCT COALESCE(t.production_type, e.production_type) as production_type FROM tours t LEFT JOIN enterprises e ON t.enterprise_id = e.id WHERE ${baseCondition} AND COALESCE(t.production_type, e.production_type) IS NOT NULL ORDER BY production_type`,
				params,
			),
			dbAll(
				`SELECT DISTINCT t.edu_program FROM tours t LEFT JOIN enterprises e ON t.enterprise_id = e.id WHERE ${baseCondition} AND t.edu_program IS NOT NULL ORDER BY t.edu_program`,
				params,
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

// Cascade filters — returns available options based on current selection
router.get("/meta/cascade", async (req, res) => {
	try {
		const { duration, min_cost, max_cost, production_type, edu_program, min_age, max_group_size, accessibility } = req.query;

		// Build WHERE clause from current filters (to exclude the filter being queried)
		const baseClauses = ['t.status = "published"'];
		const baseParams = [];

		if (duration) {
			baseClauses.push("t.duration = ?");
			baseParams.push(duration);
		}
		if (min_cost !== undefined && min_cost !== "") {
			const min = parseInt(min_cost);
			baseClauses.push("t.cost >= ?");
			baseParams.push(min);
		}
		if (max_cost !== undefined && max_cost !== "") {
			const max = parseInt(max_cost);
			baseClauses.push("t.cost <= ?");
			baseParams.push(max);
		}
		if (production_type) {
			baseClauses.push("(t.production_type = ? OR e.production_type = ?)");
			baseParams.push(production_type, production_type);
		}
		if (edu_program) {
			baseClauses.push("t.edu_program = ?");
			baseParams.push(edu_program);
		}
		if (min_age) {
			baseClauses.push("t.min_age = ?");
			baseParams.push(min_age);
		}
		if (max_group_size) {
			const sizes = { "1-5": [1, 5], "6-15": [6, 15], "16-30": [16, 30], "30+": [31, 999] };
			const range = sizes[max_group_size];
			if (range) {
				baseClauses.push("t.max_group_size >= ? AND t.max_group_size <= ?");
				baseParams.push(range[0], range[1]);
			}
		}
		if (accessibility) {
			baseClauses.push("t.accessibility LIKE ?");
			baseParams.push(`%"${accessibility}"%`);
		}

		const baseWhere = baseClauses.join(" AND ");
		const joinSQL = "FROM tours t LEFT JOIN enterprises e ON t.enterprise_id = e.id";

		// Get available values for each filter dimension
		const [durations, productionTypes, eduPrograms, minAges, groupSizes, accessibilityList] = await Promise.all([
			dbAll(
				`SELECT DISTINCT t.duration ${joinSQL} WHERE ${baseWhere} AND t.duration IS NOT NULL ORDER BY t.duration`,
				baseParams,
			),
			dbAll(
				`SELECT DISTINCT COALESCE(t.production_type, e.production_type) as production_type ${joinSQL} WHERE ${baseWhere} AND COALESCE(t.production_type, e.production_type) IS NOT NULL ORDER BY production_type`,
				baseParams,
			),
			dbAll(
				`SELECT DISTINCT t.edu_program ${joinSQL} WHERE ${baseWhere} AND t.edu_program IS NOT NULL ORDER BY t.edu_program`,
				baseParams,
			),
			dbAll(
				`SELECT DISTINCT t.min_age ${joinSQL} WHERE ${baseWhere} AND t.min_age IS NOT NULL ORDER BY t.min_age`,
				baseParams,
			),
			dbAll(
				`SELECT MIN(t.max_group_size) as min_group, MAX(t.max_group_size) as max_group ${joinSQL} WHERE ${baseWhere}`,
				baseParams,
			),
			dbAll(
				`SELECT DISTINCT t.accessibility ${joinSQL} WHERE ${baseWhere} AND t.accessibility IS NOT NULL AND t.accessibility != '[]'`,
				baseParams,
			),
		]);

		// Get cost range
		const costRange = await dbGet(
			`SELECT MIN(t.cost) as min_cost, MAX(t.cost) as max_cost ${joinSQL} WHERE ${baseWhere}`,
			baseParams,
		);

		// Collect unique accessibility values from JSON arrays
		const allAccessibility = new Set();
		for (const row of accessibilityList) {
			try {
				const arr = JSON.parse(row.accessibility);
				if (Array.isArray(arr)) arr.forEach((v) => allAccessibility.add(v));
			} catch (e) { /* ignore */ }
		}

		res.json({
			durations: durations.map((d) => d.duration),
			production_types: productionTypes.map((p) => p.production_type),
			edu_programs: eduPrograms.map((e) => e.edu_program),
			min_ages: minAges.map((a) => a.min_age),
			group_size_range: {
				min: groupSizes[0]?.min_group || 0,
				max: groupSizes[0]?.max_group || 50,
			},
			cost_range: {
				min: costRange?.min_cost || 0,
				max: costRange?.max_cost || 99999,
			},
			accessibility: [...allAccessibility],
		});
	} catch (err) {
		console.error("Cascade filters error:", err);
		res.status(500).json({ error: "Ошибка загрузки каскадных фильтров" });
	}
});

export default router;
