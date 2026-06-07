import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const result = await register(email, password, name);
		setLoading(false);

		if (result.success) {
			navigate("/");
		} else {
			setError(result.error || "Ошибка регистрации");
		}
	};

	return (
		<div className="min-h-[calc(100vh-73px)] flex items-center justify-center py-12 px-4">
			<div className="card p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold mb-2">Регистрация</h1>
					<p className="text-gray-500">
						Создайте аккаунт для бронирования экскурсий
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Имя
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="input"
							placeholder="Иван Иванов"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input"
							placeholder="your@email.com"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Пароль
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="input"
							placeholder="Минимум 6 символов"
							minLength={6}
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="btn-primary w-full disabled:opacity-50"
					>
						{loading ? "Регистрация..." : "Зарегистрироваться"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-gray-500">
						Уже есть аккаунт?{" "}
						<Link to="/login" className="text-primary-orange hover:underline">
							Войти
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
