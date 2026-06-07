import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const result = await login(email, password);
		setLoading(false);

		if (result.success) {
			navigate("/");
		} else {
			setError(result.error || "Ошибка входа");
		}
	};

	return (
		<div className="min-h-[calc(100vh-73px)] flex items-center justify-center py-12 px-4">
			<div className="card p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold mb-2">Вход в систему</h1>
					<p className="text-gray-500">
						Войдите, чтобы получить доступ к заявкам
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
							placeholder="••••••••"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="btn-primary w-full disabled:opacity-50"
					>
						{loading ? "Вход..." : "Войти"}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-gray-500">
						Нет аккаунта?{" "}
						<Link
							to="/register"
							className="text-primary-orange hover:underline"
						>
							Зарегистрироваться
						</Link>
					</p>
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200">
					<p className="text-sm text-gray-500 text-center mb-4">
						Демо-доступы (нажмите для автовхода):
					</p>
					<div className="grid grid-cols-2 gap-4 text-xs">
						<button
							type="button"
							onClick={() => {
								setEmail("admin@promorientir.ru");
								setPassword("admin123");
								setTimeout(() => {
									document.querySelector("form").requestSubmit();
								}, 100);
							}}
							className="bg-gray-50 p-3 rounded-lg text-left hover:bg-primary-orange/10 hover:border-primary-orange border border-transparent transition-all cursor-pointer"
						>
							<p className="font-medium">Администратор</p>
							<p className="text-gray-500">admin@promorientir.ru</p>
							<p className="text-gray-500">admin123</p>
						</button>
						<button
							type="button"
							onClick={() => {
								setEmail("enterprise1@demo.ru");
								setPassword("enterprise123");
								setTimeout(() => {
									document.querySelector("form").requestSubmit();
								}, 100);
							}}
							className="bg-gray-50 p-3 rounded-lg text-left hover:bg-primary-orange/10 hover:border-primary-orange border border-transparent transition-all cursor-pointer"
						>
							<p className="font-medium">Предприятие</p>
							<p className="text-gray-500">enterprise1@demo.ru</p>
							<p className="text-gray-500">enterprise123</p>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
