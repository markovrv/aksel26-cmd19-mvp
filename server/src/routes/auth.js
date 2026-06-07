import { Router } from "express";
import bcrypt from "bcryptjs";
import { dbGet, dbRun } from "../db/db.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
	try {
		const { email, password, name, role = "tourist" } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email и пароль обязательны" });
		}

		// Check if user exists
		const existing = await dbGet("SELECT id FROM users WHERE email = ?", [
			email,
		]);
		if (existing) {
			return res
				.status(400)
				.json({ error: "Пользователь с таким email уже существует" });
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 12);

		// Create user
		const result = await dbRun(
			"INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)",
			[email, passwordHash, role, name || null],
		);

		const user = { id: result.lastID, email, role, name };
		const token = generateToken(user);

		// Send VK notification about new registration
		const { sendVkNotify } = await import("../utils/vkNotify.js");
		await sendVkNotify(
			`👤 Новый пользователь зарегистрирован!\n\n📧 ${email}\n👤 ${name || "—"}\n🎭 Роль: ${role}\n\nID: ${result.lastID}`,
		);

		res.status(201).json({ user, token });
	} catch (err) {
		console.error("Register error:", err);
		res.status(500).json({ error: "Ошибка регистрации" });
	}
});

// Login
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email и пароль обязательны" });
		}

		const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

		if (!user || !user.is_active) {
			return res.status(401).json({ error: "Неверный email или пароль" });
		}

		const validPassword = await bcrypt.compare(password, user.password_hash);
		if (!validPassword) {
			return res.status(401).json({ error: "Неверный email или пароль" });
		}

		const token = generateToken(user);

		res.json({
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				name: user.name,
			},
			token,
		});
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Ошибка входа" });
	}
});

// Get current user
router.get("/me", async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Не авторизован" });
		}

		const jwt = await import("jsonwebtoken");
		const token = authHeader.split(" ")[1];
		const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";

		const decoded = jwt.default.verify(token, JWT_SECRET);
		const user = await dbGet(
			"SELECT id, email, role, name, created_at FROM users WHERE id = ? AND is_active = 1",
			[decoded.userId],
		);

		if (!user) {
			return res.status(401).json({ error: "Пользователь не найден" });
		}

		res.json({ user });
	} catch (err) {
		console.error("Get user error:", err);
		res.status(401).json({ error: "Недействительный токен" });
	}
});

export default router;
