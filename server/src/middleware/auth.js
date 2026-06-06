import jwt from "jsonwebtoken";
import { dbGet } from "../db/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me";

export async function authenticate(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Не авторизован" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await dbGet(
			"SELECT id, email, role, name FROM users WHERE id = ? AND is_active = 1",
			[decoded.userId],
		);

		if (!user) {
			return res.status(401).json({ error: "Пользователь не найден" });
		}

		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({ error: "Недействительный токен" });
	}
}

export function optionalAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next();
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(token, JWT_SECRET, async (err, decoded) => {
		if (!err && decoded) {
			const user = await dbGet(
				"SELECT id, email, role, name FROM users WHERE id = ? AND is_active = 1",
				[decoded.userId],
			);
			if (user) {
				req.user = user;
			}
		}
		next();
	});
}

export function generateToken(user) {
	return jwt.sign(
		{ userId: user.id, email: user.email, role: user.role },
		JWT_SECRET,
		{ expiresIn: "24h" },
	);
}

export default { authenticate, optionalAuth, generateToken };
