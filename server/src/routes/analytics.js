import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db/db.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = Router();

// Log event (public)
router.post("/event", async (req, res) => {
	try {
		const {
			event_type,
			entity_id,
			filter_key,
			filter_value,
			user_id,
			session_id,
		} = req.body;

		await dbRun(
			`INSERT INTO analytics_events (event_type, entity_id, filter_key, filter_value, user_id, session_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
			[event_type, entity_id, filter_key, filter_value, user_id, session_id],
		);

		res.json({ success: true });
	} catch (err) {
		console.error("Log event error:", err);
		res.status(500).json({ error: "Ошибка логирования" });
	}
});

// Global analytics (admin only)
router.get("/global", authenticate, requireRole("admin"), async (req, res) => {
	try {
		const [overview, topTours, bookingsByStatus] = await Promise.all([
			dbAll(`
        SELECT 
          (SELECT COUNT(*) FROM enterprises WHERE status = 'published') as enterprises,
          (SELECT COUNT(*) FROM tours WHERE status = 'published') as tours,
          (SELECT COUNT(*) FROM bookings) as bookings,
          (SELECT COUNT(*) FROM users) as users
      `),
			dbAll(`
        SELECT t.id, t.title, t.views_count, e.name as enterprise_name
        FROM tours t
        JOIN enterprises e ON t.enterprise_id = e.id
        WHERE t.status = 'published'
        ORDER BY t.views_count DESC
        LIMIT 10
      `),
			dbAll(`
        SELECT status, COUNT(*) as count
        FROM bookings
        GROUP BY status
      `),
		]);

		res.json({
			overview: overview[0] || {},
			top_tours_by_views: topTours,
			bookings_by_status: bookingsByStatus,
		});
	} catch (err) {
		console.error("Global analytics error:", err);
		res.status(500).json({ error: "Ошибка загрузки аналитики" });
	}
});

// Enterprise analytics (for enterprise users)
router.get(
	"/enterprise/:enterpriseId",
	authenticate,
	requireRole("enterprise", "admin"),
	async (req, res) => {
		try {
			const { enterpriseId } = req.params;

			// Check permission
			if (req.user.role === "enterprise") {
				const enterprise = await dbGet(
					"SELECT user_id FROM enterprises WHERE id = ?",
					[enterpriseId],
				);
				if (enterprise?.user_id !== req.user.id) {
					return res.status(403).json({ error: "Недостаточно прав" });
				}
			}

			const [toursViews, bookingsByTour] = await Promise.all([
				dbAll(
					`
        SELECT id, title, views_count
        FROM tours
        WHERE enterprise_id = ?
        ORDER BY views_count DESC
      `,
					[enterpriseId],
				),
				dbAll(
					`
        SELECT t.id, t.title,
               COUNT(b.id) as total_bookings,
               SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
        FROM tours t
        LEFT JOIN bookings b ON t.id = b.tour_id
        WHERE t.enterprise_id = ?
        GROUP BY t.id
      `,
					[enterpriseId],
				),
			]);

			res.json({
				tours_views: toursViews,
				bookings_by_tour: bookingsByTour,
			});
		} catch (err) {
			console.error("Enterprise analytics error:", err);
			res.status(500).json({ error: "Ошибка загрузки аналитики" });
		}
	},
);

export default router;
