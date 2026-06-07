import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase } from "./db/init-db.js";
import { seedDatabase } from "./db/seed.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes
import authRoutes from "./routes/auth.js";
import enterprisesRoutes from "./routes/enterprises.js";
import toursRoutes from "./routes/tours.js";
import bookingsRoutes from "./routes/bookings.js";
import placesRoutes from "./routes/places.js";
import assistantRoutes from "./routes/assistant.js";
import analyticsRoutes from "./routes/analytics.js";
import adminRoutes from "./routes/admin.js";
import settingsRoutes from "./routes/settings.js";
import enterpriseLkRoutes from "./routes/enterprise-lk.js";
import regionsRoutes from "./routes/regions.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? process.env.ALLOWED_ORIGIN || "https://promorientir.ru"
				: [
						"http://localhost:5173",
						"http://localhost:3000",
						"http://127.0.0.1:5173",
					],
		credentials: true,
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api/", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/enterprises", enterprisesRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/enterprise-lk", enterpriseLkRoutes);
app.use("/api/regions", regionsRoutes);

// Serve static files from the client build directory
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));

// Error handling
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// 404 handler - serve index.html for SPA routes
app.use((req, res) => {
	if (req.path.startsWith("/api/")) {
		res.status(404).json({ error: "Маршрут не найден" });
	} else {
		res.sendFile(path.join(clientDist, "index.html"));
	}
});

// Start server
async function start() {
	try {
		console.log("🚀 Запуск ПромОриентир сервера...");

		// Initialize database
		await initDatabase();

		// Seed demo data
		await seedDatabase();

		app.listen(PORT, () => {
			console.log(`✅ Сервер запущен на порту ${PORT}`);
			console.log(`📍 http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("❌ Ошибка запуска:", err);
		process.exit(1);
	}
}

start();

export default app;
