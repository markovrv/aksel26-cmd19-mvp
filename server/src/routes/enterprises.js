import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";

const router = Router();

// Get all enterprises (public)
router.get("/", optionalAuth, async (req, res) => {
	try {
		const { region, production_type, status = "published" } = req.query;

		let sql = `SELECT e.*, u.name as user_name 
               FROM enterprises e 
               LEFT JOIN users u ON e.user_id = u.id 
               WHERE e.status = ?`;
		const params = [status];

		if (region) {
			sql += " AND e.region = ?";
			params.push(region);
		}

		if (production_type) {
			sql += " AND e.production_type = ?";
			params.push(production_type);
		}

		sql += " ORDER BY e.created_at DESC";

		const enterprises = await dbAll(sql, params);

		// Parse JSON fields
		const result = enterprises.map((e) => ({
			...e,
			certifications: JSON.parse(e.certifications || "[]"),
			live_stats: JSON.parse(e.live_stats || "{}"),
			souvenirs: JSON.parse(e.souvenirs || "[]"),
			professions: JSON.parse(e.professions || "[]"),
			tags: JSON.parse(e.tags || "[]"),
		}));

		res.json({ enterprises: result });
	} catch (err) {
		console.error("Get enterprises error:", err);
		res.status(500).json({ error: "Ошибка загрузки предприятий" });
	}
});

// Get single enterprise
router.get("/:id", optionalAuth, async (req, res) => {
	try {
		const { id } = req.params;

		const enterprise = await dbGet(
			`SELECT e.*, u.name as user_name 
       FROM enterprises e 
       LEFT JOIN users u ON e.user_id = u.id 
       WHERE e.id = ?`,
			[id],
		);

		if (!enterprise) {
			return res.status(404).json({ error: "Предприятие не найдено" });
		}

		// Parse JSON fields
		const result = {
			...enterprise,
			certifications: JSON.parse(enterprise.certifications || "[]"),
			live_stats: JSON.parse(enterprise.live_stats || "{}"),
			souvenirs: JSON.parse(enterprise.souvenirs || "[]"),
			professions: JSON.parse(enterprise.professions || "[]"),
			tags: JSON.parse(enterprise.tags || "[]"),
		};

		res.json({ enterprise: result });
	} catch (err) {
		console.error("Get enterprise error:", err);
		res.status(500).json({ error: "Ошибка загрузки предприятия" });
	}
});

// Get regions list
router.get("/meta/regions", async (req, res) => {
	try {
		const regions = await dbAll(
			'SELECT DISTINCT region FROM enterprises WHERE status = "published" ORDER BY region',
		);
		res.json({ regions: regions.map((r) => r.region) });
	} catch (err) {
		console.error("Get regions error:", err);
		res.status(500).json({ error: "Ошибка загрузки регионов" });
	}
});

// Get production types
router.get("/meta/production-types", async (req, res) => {
	try {
		const types = await dbAll(
			'SELECT DISTINCT production_type FROM enterprises WHERE status = "published" ORDER BY production_type',
		);
		res.json({ types: types.map((t) => t.production_type) });
	} catch (err) {
		console.error("Get production types error:", err);
		res.status(500).json({ error: "Ошибка загрузки типов производства" });
	}
});

export default router;
