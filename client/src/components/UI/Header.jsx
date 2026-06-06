import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../App";

export default function Header() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-lg bg-primary-orange flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
								/>
							</svg>
						</div>
						<div>
							<span className="font-bold text-lg text-primary-dark">
								ПромОриентир
							</span>
							<span className="hidden sm:block text-xs text-gray-500">
								Промышленный туризм
							</span>
						</div>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							to="/catalog"
							className="text-gray-700 hover:text-primary-orange transition-colors font-medium"
						>
							Каталог
						</Link>
						<Link
							to="/assistant"
							className="text-gray-700 hover:text-primary-orange transition-colors font-medium"
						>
							AI-Ассистент
						</Link>
						<Link
							to="/compare"
							className="text-gray-700 hover:text-primary-orange transition-colors font-medium"
						>
							Сравнение
						</Link>
					</nav>

					<div className="flex items-center gap-3">
						{user ? (
							<>
								<Link
									to="/my-bookings"
									className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-orange transition-colors"
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									Мои заявки
								</Link>

								{(user.role === "enterprise" || user.role === "admin") && (
									<Link
										to="/enterprise-lk"
										className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-blue transition-colors"
									>
										ЛК
									</Link>
								)}

								{user.role === "admin" && (
									<Link
										to="/admin"
										className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-blue transition-colors"
									>
										Админка
									</Link>
								)}

								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center font-medium text-sm">
										{user.name?.[0] || user.email[0].toUpperCase()}
									</div>
									<button
										onClick={handleLogout}
										className="text-sm text-gray-500 hover:text-red-500 transition-colors"
									>
										Выход
									</button>
								</div>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="px-4 py-2 text-gray-700 hover:text-primary-orange transition-colors font-medium"
								>
									Войти
								</Link>
								<Link to="/register" className="btn-primary">
									Регистрация
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
