import React, { createContext, useContext, useState, useEffect } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Link,
	useNavigate,
	useParams,
} from "react-router-dom";
import { auth } from "./api";

// Context
const AuthContext = createContext(null);

function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			auth
				.me()
				.then((data) => setUser(data.user))
				.catch(() => localStorage.removeItem("token"))
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
		}
	}, []);

	const login = async (email, password) => {
		const data = await auth.login({ email, password });
		localStorage.setItem("token", data.token);
		setUser(data.user);
		return data.user;
	};

	const register = async (email, password, name) => {
		const data = await auth.register({ email, password, name });
		localStorage.setItem("token", data.token);
		setUser(data.user);
		return data.user;
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

function useAuth() {
	return useContext(AuthContext);
}

// Header Component
function Header() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
						<svg
							className="w-6 h-6 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
					</div>
					<span className="text-xl font-bold text-text-dark">ПромОриентир</span>
				</Link>

				<nav className="flex items-center gap-6">
					<Link
						to="/catalog"
						className="text-gray-600 hover:text-primary-orange transition-colors"
					>
						Каталог
					</Link>
					<Link
						to="/compare"
						className="text-gray-600 hover:text-primary-orange transition-colors"
					>
						Сравнение
					</Link>

					{user ? (
						<div className="flex items-center gap-4">
							{user.role === "admin" && (
								<Link
									to="/admin"
									className="text-industrial-blue hover:underline"
								>
									Админка
								</Link>
							)}
							<Link
								to="/bookings"
								className="text-gray-600 hover:text-primary-orange"
							>
								Мои заявки
							</Link>
							<div className="flex items-center gap-3">
								<span className="text-sm text-gray-600">{user.email}</span>
								<button onClick={logout} className="btn-outline text-sm">
									Выйти
								</button>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<Link to="/login" className="btn-outline text-sm">
								Войти
							</Link>
							<Link to="/register" className="btn-primary text-sm">
								Регистрация
							</Link>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
}

// Home Page
function Home() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 overflow-hidden">
				<div className="absolute inset-0 grid-pattern opacity-10"></div>
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
							Откройте мир{" "}
							<span className="text-primary-orange">промышленного</span> туризма
						</h1>
						<p className="text-xl text-gray-300 mb-8 leading-relaxed">
							Умный компас для подбора и бронирования экскурсий на лучшие
							предприятия России
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								onClick={() => navigate("/catalog")}
								className="btn-primary text-lg px-8 py-4"
							>
								Начать探索
							</button>
							<Link
								to="/assistant"
								className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4"
							>
								AI-помощник
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-20 bg-bg-main">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">
						Возможности платформы
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="card p-8 text-center hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 bg-primary-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg
									className="w-8 h-8 text-primary-orange"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Интерактивная карта
							</h3>
							<p className="text-gray-600">
								Выбирайте регион и находите предприятия на интерактивной карте
								России
							</p>
						</div>
						<div className="card p-8 text-center hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 bg-industrial-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg
									className="w-8 h-8 text-industrial-blue"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h7"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-3">Умные фильтры</h3>
							<p className="text-gray-600">
								Каскадная фильтрация по 6 параметрам для точного подбора
								экскурсий
							</p>
						</div>
						<div className="card p-8 text-center hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-3">AI-ассистент</h3>
							<p className="text-gray-600">
								Умный помощник подберёт идеальные экскурсии под ваши
								предпочтения
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
						<div>
							<div className="text-4xl font-bold text-primary-orange mb-2">
								7+
							</div>
							<div className="text-gray-600">Предприятий</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-industrial-blue mb-2">
								7+
							</div>
							<div className="text-gray-600">Экскурсий</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-green-600 mb-2">14+</div>
							<div className="text-gray-600">Мест nearby</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-purple-600 mb-2">6</div>
							<div className="text-gray-600">Регионов</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-gradient-to-r from-primary-orange to-orange-600 text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Готовы к открытиям?</h2>
					<p className="text-xl mb-8 opacity-90">
						Начните с AI-ассистента или изучите каталог
					</p>
					<Link
						to="/assistant"
						className="inline-block bg-white text-primary-orange font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
					>
						Поговорить с AI-помощником
					</Link>
				</div>
			</section>
		</div>
	);
}

// Login Page
function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await login(form.email, form.password);
			navigate("/");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-bg-main flex items-center justify-center py-12">
			<div className="card p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold text-center mb-8">Вход в систему</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Email</label>
						<input
							type="email"
							className="input"
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Пароль</label>
						<input
							type="password"
							className="input"
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							required
						/>
					</div>
					{error && <div className="text-red-500 text-sm">{error}</div>}
					<button
						type="submit"
						className="btn-primary w-full"
						disabled={loading}
					>
						{loading ? "Вход..." : "Войти"}
					</button>
				</form>
				<p className="text-center mt-4 text-gray-600">
					Нет аккаунта?{" "}
					<Link to="/register" className="text-primary-orange">
						Зарегистрироваться
					</Link>
				</p>
				<div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
					<p className="font-medium mb-2">Тестовые аккаунты:</p>
					<p>Админ: admin@promorientir.ru / admin123</p>
					<p>Предприятие: enterprise1@demo.ru / enterprise123</p>
				</div>
			</div>
		</div>
	);
}

// Register Page
function Register() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "", name: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await register(form.email, form.password, form.name);
			navigate("/");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-bg-main flex items-center justify-center py-12">
			<div className="card p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold text-center mb-8">Регистрация</h1>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Имя</label>
						<input
							type="text"
							className="input"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Email</label>
						<input
							type="email"
							className="input"
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Пароль</label>
						<input
							type="password"
							className="input"
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							required
						/>
					</div>
					{error && <div className="text-red-500 text-sm">{error}</div>}
					<button
						type="submit"
						className="btn-primary w-full"
						disabled={loading}
					>
						{loading ? "Регистрация..." : "Зарегистрироваться"}
					</button>
				</form>
				<p className="text-center mt-4 text-gray-600">
					Уже есть аккаунт?{" "}
					<Link to="/login" className="text-primary-orange">
						Войти
					</Link>
				</p>
			</div>
		</div>
	);
}

// Catalog Page
function Catalog() {
	const [enterprises, setEnterprises] = useState([]);
	const [tours, setTours] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		production_type: "",
		duration: "",
		min_cost: "",
		max_cost: "",
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [entData, toursData] = await Promise.all([
				enterprises.list({ status: "published" }),
				tours.list({ status: "published" }),
			]);
			setEnterprises(entData.enterprises || []);
			setTours(toursData.tours || []);
		} catch (err) {
			console.error("Load error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Каталог предприятий</h1>

			{/* Filters */}
			<div className="card p-6 mb-8">
				<div className="flex flex-wrap gap-4">
					<select
						className="input w-48"
						value={filters.production_type}
						onChange={(e) =>
							setFilters({ ...filters, production_type: e.target.value })
						}
					>
						<option value="">Тип производства</option>
						<option value="Строительное">Строительное</option>
						<option value="Пищевое">Пищевое</option>
						<option value="Машиностроение">Машиностроение</option>
						<option value="Лёгкая промышленность">Лёгкая промышленность</option>
						<option value="IT-производство">IT-производство</option>
					</select>
					<select
						className="input w-40"
						value={filters.duration}
						onChange={(e) =>
							setFilters({ ...filters, duration: e.target.value })
						}
					>
						<option value="">Длительность</option>
						<option value="1h">1 час</option>
						<option value="2h">2 часа</option>
						<option value="half_day">Полдня</option>
						<option value="full_day">Полный день</option>
					</select>
					<select
						className="input w-40"
						value={filters.min_cost}
						onChange={(e) =>
							setFilters({ ...filters, min_cost: e.target.value })
						}
					>
						<option value="">Цена от</option>
						<option value="0">Бесплатно</option>
						<option value="1">От 1 ₽</option>
						<option value="500">От 500 ₽</option>
						<option value="1000">От 1000 ₽</option>
					</select>
				</div>
			</div>

			{loading ? (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="card p-6 animate-pulse">
							<div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
							<div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						</div>
					))}
				</div>
			) : (
				<>
					{/* Enterprises */}
					<section className="mb-12">
						<h2 className="text-xl font-semibold mb-4">Предприятия</h2>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{enterprises
								.filter(
									(e) =>
										!filters.production_type ||
										e.production_type === filters.production_type,
								)
								.map((enterprise) => (
									<Link
										key={enterprise.id}
										to={`/enterprise/${enterprise.id}`}
										className={`card p-6 hover:shadow-lg transition-shadow industrial-border-${enterprise.production_type?.toLowerCase().replace(" ", "-")}`}
										style={{
											borderLeftColor:
												enterprise.production_type === "Пищевое"
													? "#22C55E"
													: enterprise.production_type === "Машиностроение"
														? "#EF4444"
														: enterprise.production_type === "IT-производство"
															? "#8B5CF6"
															: "#E05A00",
										}}
									>
										<div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
											<svg
												className="w-12 h-12 text-gray-400"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1}
													d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
												/>
											</svg>
										</div>
										<h3 className="text-lg font-semibold mb-2">
											{enterprise.name}
										</h3>
										<div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
											<span className="badge badge-blue">
												{enterprise.production_type}
											</span>
											<span>{enterprise.region}</span>
										</div>
										<p className="text-gray-600 text-sm line-clamp-2">
											{enterprise.description}
										</p>
										<div className="flex flex-wrap gap-1 mt-3">
											{(enterprise.tags || []).slice(0, 3).map((tag) => (
												<span
													key={tag}
													className="text-xs bg-gray-100 px-2 py-1 rounded"
												>
													{tag}
												</span>
											))}
										</div>
									</Link>
								))}
						</div>
					</section>

					{/* Tours */}
					<section>
						<h2 className="text-xl font-semibold mb-4">Экскурсии</h2>
						<div className="grid md:grid-cols-2 gap-6">
							{tours.map((tour) => (
								<Link
									key={tour.id}
									to={`/tour/${tour.id}`}
									className="card p-6 hover:shadow-lg transition-shadow"
								>
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-lg font-semibold">{tour.title}</h3>
											<p className="text-sm text-gray-500">
												{tour.enterprise_name}
											</p>
										</div>
										<div className="text-right">
											<div className="text-xl font-bold text-primary-orange">
												{tour.cost === 0 ? "Бесплатно" : `${tour.cost} ₽`}
											</div>
										</div>
									</div>
									<div className="flex flex-wrap gap-3 text-sm text-gray-600">
										<span className="flex items-center gap-1">
											<svg
												className="w-4 h-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											{tour.duration === "1h"
												? "1 час"
												: tour.duration === "2h"
													? "2 часа"
													: tour.duration === "half_day"
														? "Полдня"
														: "Полный день"}
										</span>
										<span className="flex items-center gap-1">
											<svg
												className="w-4 h-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
											до {tour.max_group_size} чел.
										</span>
										<span className="flex items-center gap-1">
											<svg
												className="w-4 h-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 10V3L4 14h7v7l9-11h-7z"
												/>
											</svg>
											Интерактивность: {tour.interactivity_level}/10
										</span>
									</div>
									<div className="mt-4 flex items-center justify-between">
										<span className="badge badge-orange">
											{tour.production_type}
										</span>
										<button className="text-primary-orange font-medium text-sm">
											Подробнее →
										</button>
									</div>
								</Link>
							))}
						</div>
					</section>
				</>
			)}
		</div>
	);
}

// Enterprise Page
function Enterprise() {
	const { id } = useParams();
	const [enterprise, setEnterprise] = useState(null);
	const [tours, setTours] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("about");

	useEffect(() => {
		loadData();
	}, [id]);

	const loadData = async () => {
		try {
			const [entData, toursData] = await Promise.all([
				enterprises.get(id),
				tours.list({ enterprise_id: id, status: "published" }),
			]);
			setEnterprise(entData.enterprise);
			setTours(toursData.tours || []);
		} catch (err) {
			console.error("Load error:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div className="container mx-auto px-4 py-8">Загрузка...</div>;
	}

	if (!enterprise) {
		return (
			<div className="container mx-auto px-4 py-8">Предприятие не найдено</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="card p-8 mb-8">
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-3xl font-bold mb-2">{enterprise.name}</h1>
						<div className="flex items-center gap-3 text-gray-600">
							<span className="badge badge-blue">
								{enterprise.production_type}
							</span>
							<span>{enterprise.region}</span>
							<span>{enterprise.address}</span>
						</div>
					</div>
					{enterprise.site_url && (
						<a
							href={enterprise.site_url}
							target="_blank"
							rel="noopener noreferrer"
							className="btn-secondary"
						>
							Сайт предприятия
						</a>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6">
				{["about", "myth", "professions", "tours"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-4 py-2 rounded-lg font-medium ${
							activeTab === tab ? "bg-primary-orange text-white" : "bg-gray-100"
						}`}
					>
						{tab === "about"
							? "О предприятии"
							: tab === "myth"
								? "Миф и реальность"
								: tab === "professions"
									? "Профессии"
									: "Экскурсии"}
					</button>
				))}
			</div>

			{/* Content */}
			{activeTab === "about" && (
				<div className="grid md:grid-cols-2 gap-8">
					<div className="card p-6">
						<h2 className="text-xl font-semibold mb-4">Описание</h2>
						<p className="text-gray-600 leading-relaxed">
							{enterprise.description}
						</p>

						{enterprise.vk_video_url && (
							<div className="mt-6">
								<h3 className="font-medium mb-3">Видео</h3>
								<iframe
									src={enterprise.vk_video_url.replace(
										"vkvideo.ru",
										"vk.com/video_ext.php",
									)}
									className="w-full h-64 rounded-lg"
									allowFullScreen
								/>
							</div>
						)}
					</div>
					<div className="space-y-6">
						{/* Certifications */}
						{(enterprise.certifications || []).length > 0 && (
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">Сертификаты</h2>
								<div className="flex flex-wrap gap-3">
									{enterprise.certifications.map((cert, i) => (
										<div
											key={i}
											className="badge badge-green flex items-center gap-2"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
												/>
											</svg>
											{cert.name} ({cert.year})
										</div>
									))}
								</div>
							</div>
						)}

						{/* Live Stats */}
						{enterprise.live_stats &&
							Object.keys(enterprise.live_stats).length > 0 && (
								<div className="card p-6">
									<h2 className="text-xl font-semibold mb-4">
										Живая статистика
									</h2>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-center p-4 bg-gray-50 rounded-lg">
											<div className="text-2xl font-bold text-primary-orange">
												{enterprise.live_stats.noise_db || 0}
											</div>
											<div className="text-sm text-gray-500">дБ шум</div>
										</div>
										<div className="text-center p-4 bg-gray-50 rounded-lg">
											<div className="text-2xl font-bold text-green-600">
												{enterprise.live_stats.emissions_tons || 0}
											</div>
											<div className="text-sm text-gray-500">тонн выбросов</div>
										</div>
										<div className="text-center p-4 bg-gray-50 rounded-lg">
											<div className="text-2xl font-bold text-industrial-blue">
												{enterprise.live_stats.accidents_5y || 0}
											</div>
											<div className="text-sm text-gray-500">
												аварий за 5 лет
											</div>
										</div>
									</div>
								</div>
							)}
					</div>
				</div>
			)}

			{activeTab === "myth" && (
				<div className="grid md:grid-cols-2 gap-8">
					<div className="card p-6">
						<h2 className="text-xl font-semibold mb-4">360°-тур</h2>
						<div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
							<div className="text-center">
								<svg
									className="w-16 h-16 text-gray-400 mx-auto mb-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
								<p className="text-gray-500">Контент в разработке</p>
							</div>
						</div>
					</div>
					<div className="card p-6">
						<h2 className="text-xl font-semibold mb-4">AR-контент</h2>
						<div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
							<div className="text-center">
								<svg
									className="w-16 h-16 text-gray-400 mx-auto mb-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1}
										d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<p className="text-gray-500">Контент в разработке</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === "professions" && (
				<div className="card p-6">
					<h2 className="text-xl font-semibold mb-6">
						Востребованные профессии
					</h2>
					<div className="space-y-4">
						{(enterprise.professions || []).map((prof, i) => (
							<div key={i} className="p-4 bg-gray-50 rounded-lg">
								<h3 className="font-semibold mb-2">{prof.name}</h3>
								<div className="flex flex-wrap gap-2">
									{(prof.skills || []).map((skill, j) => (
										<span
											key={j}
											className="text-sm bg-white px-3 py-1 rounded border border-gray-200"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{activeTab === "tours" && (
				<div className="grid md:grid-cols-2 gap-6">
					{tours.map((tour) => (
						<Link
							key={tour.id}
							to={`/tour/${tour.id}`}
							className="card p-6 hover:shadow-lg transition-shadow"
						>
							<h3 className="text-lg font-semibold mb-2">{tour.title}</h3>
							<p className="text-gray-600 text-sm mb-4">{tour.description}</p>
							<div className="flex items-center justify-between">
								<span className="text-xl font-bold text-primary-orange">
									{tour.cost === 0 ? "Бесплатно" : `${tour.cost} ₽`}
								</span>
								<button className="btn-primary text-sm">Записаться</button>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

// Tour Page
function Tour() {
	const { id } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	const [tour, setTour] = useState(null);
	const [loading, setLoading] = useState(true);
	const [booking, setBooking] = useState(false);
	const [form, setForm] = useState({
		full_name: user?.name || "",
		email: user?.email || "",
		phone: "",
		group_size: 10,
		desired_date: "",
		special_needs: "",
		tb_accepted: false,
	});
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		loadTour();
	}, [id]);

	const loadTour = async () => {
		try {
			const data = await tours.get(id);
			setTour(data.tour);
		} catch (err) {
			console.error("Load error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleBooking = async (e) => {
		e.preventDefault();
		if (!form.tb_accepted) {
			alert("Необходимо принять инструкцию по технике безопасности");
			return;
		}

		setBooking(true);
		try {
			await bookings.create({ tour_id: id, ...form });
			setSuccess(true);
		} catch (err) {
			alert(err.message);
		} finally {
			setBooking(false);
		}
	};

	if (loading) {
		return <div className="container mx-auto px-4 py-8">Загрузка...</div>;
	}

	if (!tour) {
		return (
			<div className="container mx-auto px-4 py-8">Экскурсия не найдена</div>
		);
	}

	if (success) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="card p-12 text-center max-w-2xl mx-auto">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg
							className="w-10 h-10 text-green-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold mb-4">
						Заявка успешно отправлена!
					</h1>
					<p className="text-gray-600 mb-8">
						Мы свяжемся с вами для уточнения деталей экскурсии.
					</p>
					<button onClick={() => navigate("/catalog")} className="btn-primary">
						Вернуться к каталогу
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid md:grid-cols-3 gap-8">
				{/* Main Content */}
				<div className="md:col-span-2 space-y-6">
					<div className="card p-8">
						<h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
						<p className="text-gray-600 mb-6">{tour.description}</p>

						{/* Stats */}
						<div className="grid grid-cols-4 gap-4 mb-8">
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-primary-orange">
									{tour.cost === 0 ? "Бесплатно" : `${tour.cost} ₽`}
								</div>
								<div className="text-sm text-gray-500">Стоимость</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-industrial-blue">
									{tour.duration === "1h"
										? "1ч"
										: tour.duration === "2h"
											? "2ч"
											: tour.duration === "half_day"
												? "½ дня"
												: "День"}
								</div>
								<div className="text-sm text-gray-500">Длительность</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-green-600">
									{tour.max_group_size}
								</div>
								<div className="text-sm text-gray-500">Макс. группа</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl font-bold text-purple-600">
									{tour.min_age}+
								</div>
								<div className="text-sm text-gray-500">Мин. возраст</div>
							</div>
						</div>

						{/* Interactivity & Load */}
						<div className="grid grid-cols-2 gap-6 mb-8">
							<div>
								<h3 className="font-medium mb-2">Уровень интерактивности</h3>
								<div className="gauge">
									<div
										className="gauge-fill bg-primary-orange"
										style={{ width: `${tour.interactivity_level * 10}%` }}
									></div>
								</div>
								<div className="text-sm text-gray-500 mt-1">
									{tour.interactivity_level}/10
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-2">Физическая нагрузка</h3>
								<div className="gauge">
									<div
										className="gauge-fill bg-industrial-blue"
										style={{ width: `${tour.physical_load * 10}%` }}
									></div>
								</div>
								<div className="text-sm text-gray-500 mt-1">
									{tour.physical_load}/10
								</div>
							</div>
						</div>

						{/* Features */}
						<div className="flex flex-wrap gap-3">
							{tour.ppe_required && (
								<span className="badge badge-orange">Нужны СИЗ</span>
							)}
							{tour.food_on_site && (
								<span className="badge badge-green">Питание на месте</span>
							)}
							{tour.has_souvenirs && (
								<span className="badge badge-blue">Сувениры</span>
							)}
							{tour.has_degustation && (
								<span className="badge badge-blue">Дегустация</span>
							)}
							{tour.has_photo_spots && (
								<span className="badge badge-blue">Фото-зоны</span>
							)}
						</div>
					</div>

					{/* Safety */}
					{tour.safety_instructions && (
						<div className="card p-6">
							<h2 className="text-xl font-semibold mb-4">
								Инструкция по технике безопасности
							</h2>
							<p className="text-gray-600">{tour.safety_instructions}</p>
						</div>
					)}
				</div>

				{/* Booking Form */}
				<div className="card p-6 h-fit sticky top-24">
					<h2 className="text-xl font-semibold mb-6">
						Записаться на экскурсию
					</h2>
					<form onSubmit={handleBooking} className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">ФИО *</label>
							<input
								type="text"
								className="input"
								value={form.full_name}
								onChange={(e) =>
									setForm({ ...form, full_name: e.target.value })
								}
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">Email *</label>
							<input
								type="email"
								className="input"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">Телефон</label>
							<input
								type="tel"
								className="input"
								value={form.phone}
								onChange={(e) => setForm({ ...form, phone: e.target.value })}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Количество человек *
								</label>
								<input
									type="number"
									className="input"
									min="1"
									max={tour.max_group_size}
									value={form.group_size}
									onChange={(e) =>
										setForm({ ...form, group_size: parseInt(e.target.value) })
									}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">
									Желаемая дата
								</label>
								<input
									type="date"
									className="input"
									value={form.desired_date}
									onChange={(e) =>
										setForm({ ...form, desired_date: e.target.value })
									}
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">
								Особые пожелания
							</label>
							<textarea
								className="input"
								rows="3"
								value={form.special_needs}
								onChange={(e) =>
									setForm({ ...form, special_needs: e.target.value })
								}
							/>
						</div>
						<label className="flex items-start gap-3">
							<input
								type="checkbox"
								className="mt-1"
								checked={form.tb_accepted}
								onChange={(e) =>
									setForm({ ...form, tb_accepted: e.target.checked })
								}
								required
							/>
							<span className="text-sm text-gray-600">
								Я ознакомлен с инструкцией по технике безопасности и принимаю её
								условия
							</span>
						</label>
						<button
							type="submit"
							className="btn-primary w-full"
							disabled={booking}
						>
							{booking ? "Отправка..." : "Подать заявку"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

// My Bookings
function MyBookings() {
	const { user } = useAuth();
	const [bookingsList, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadBookings();
	}, []);

	const loadBookings = async () => {
		try {
			const data = await bookings.list();
			setBookings(data.bookings || []);
		} catch (err) {
			console.error("Load error:", err);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status) => {
		const badges = {
			new: { class: "badge-orange", text: "Новая" },
			reviewing: { class: "badge-blue", text: "На рассмотрении" },
			confirmed: { class: "badge-green", text: "Подтверждена" },
			rejected: { class: "bg-red-100 text-red-600", text: "Отклонена" },
			cancelled: { class: "bg-gray-100 text-gray-600", text: "Отменена" },
		};
		return badges[status] || badges.new;
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Мои заявки</h1>

			{loading ? (
				<div className="text-center py-12">Загрузка...</div>
			) : bookingsList.length === 0 ? (
				<div className="card p-12 text-center">
					<p className="text-gray-500 mb-4">У вас пока нет заявок</p>
					<Link to="/catalog" className="btn-primary">
						Перейти в каталог
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{bookingsList.map((b) => (
						<div key={b.id} className="card p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold">{b.tour_title}</h3>
									<p className="text-gray-500">{b.enterprise_name}</p>
								</div>
								<span className={`badge ${getStatusBadge(b.status).class}`}>
									{getStatusBadge(b.status).text}
								</span>
							</div>
							<div className="mt-4 flex gap-6 text-sm text-gray-600">
								<span>👥 {b.group_size} человек</span>
								{b.desired_date && <span>📅 {b.desired_date}</span>}
								<span>📧 {b.email}</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Compare Page
function Compare() {
	const [tours, setTours] = useState([]);
	const [compareIds, setCompareIds] = useState([]);

	useEffect(() => {
		tours
			.list({ status: "published" })
			.then((data) => setTours(data.tours || []));
	}, []);

	const toggleCompare = (id) => {
		if (compareIds.includes(id)) {
			setCompareIds(compareIds.filter((i) => i !== id));
		} else if (compareIds.length < 3) {
			setCompareIds([...compareIds, id]);
		}
	};

	const compareTours = tours.filter((t) => compareIds.includes(t.id));

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Сравнение экскурсий</h1>

			{compareIds.length === 0 ? (
				<div className="card p-12 text-center">
					<p className="text-gray-500 mb-4">
						Выберите до 3 экскурсий для сравнения
					</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full card">
						<thead>
							<tr className="border-b">
								<th className="p-4 text-left">Параметр</th>
								{compareTours.map((t) => (
									<th key={t.id} className="p-4 text-center">
										{t.title}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							<tr className="border-b">
								<td className="p-4 font-medium">Стоимость</td>
								{compareTours.map((t) => (
									<td
										key={t.id}
										className="p-4 text-center font-bold text-primary-orange"
									>
										{t.cost === 0 ? "Бесплатно" : `${t.cost} ₽`}
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Длительность</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										{t.duration === "1h"
											? "1 час"
											: t.duration === "2h"
												? "2 часа"
												: t.duration === "half_day"
													? "Полдня"
													: "Полный день"}
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Интерактивность</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										<div className="gauge max-w-32 mx-auto">
											<div
												className="gauge-fill bg-primary-orange"
												style={{ width: `${t.interactivity_level * 10}%` }}
											></div>
										</div>
										<span className="text-sm">{t.interactivity_level}/10</span>
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Физическая нагрузка</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										<div className="gauge max-w-32 mx-auto">
											<div
												className="gauge-fill bg-industrial-blue"
												style={{ width: `${t.physical_load * 10}%` }}
											></div>
										</div>
										<span className="text-sm">{t.physical_load}/10</span>
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Макс. группа</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										{t.max_group_size} чел.
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Питание</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										{t.food_on_site ? "✅" : "❌"}
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Сувениры</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										{t.has_souvenirs ? "✅" : "❌"}
									</td>
								))}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Дегустация</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center">
										{t.has_degustation ? "✅" : "❌"}
									</td>
								))}
							</tr>
							<tr>
								<td className="p-4 font-medium">Предприятие</td>
								{compareTours.map((t) => (
									<td key={t.id} className="p-4 text-center text-sm">
										{t.enterprise_name}
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			)}

			{/* Add to compare */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Добавить к сравнению</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					{tours
						.filter((t) => !compareIds.includes(t.id))
						.slice(0, 6)
						.map((t) => (
							<div
								key={t.id}
								className="card p-4 flex items-center justify-between"
							>
								<div>
									<h3 className="font-medium">{t.title}</h3>
									<p className="text-sm text-gray-500">{t.enterprise_name}</p>
								</div>
								<button
									onClick={() => toggleCompare(t.id)}
									disabled={compareIds.length >= 3}
									className="btn-outline text-sm"
								>
									+ Сравнить
								</button>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

// AI Assistant Page
function Assistant() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [recommendations, setRecommendations] = useState([]);

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage = { role: "user", content: input };
		setMessages([...messages, userMessage]);
		setInput("");
		setLoading(true);

		try {
			const data = await assistant.chat([...messages, userMessage]);
			const assistantMessage = { role: "assistant", content: data.response };
			setMessages([...messages, userMessage, assistantMessage]);

			if (data.tours?.length > 0) {
				setRecommendations(data.tours);
			}
		} catch (err) {
			console.error("Assistant error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">
				🧭 Smart Compass — AI-помощник
			</h1>

			<div className="grid md:grid-cols-3 gap-8">
				{/* Chat */}
				<div className="md:col-span-2">
					<div className="card p-6">
						<div className="h-96 overflow-y-auto mb-4 space-y-4">
							{messages.length === 0 && (
								<div className="text-center text-gray-500 py-12">
									<p className="mb-4">
										Привет! Я помогу подобрать идеальную экскурсию.
									</p>
									<p>Расскажите, что вас интересует:</p>
								</div>
							)}
							{messages.map((m, i) => (
								<div
									key={i}
									className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-2xl p-4 rounded-lg ${
											m.role === "user"
												? "bg-primary-orange text-white"
												: "bg-gray-100"
										}`}
									>
										{m.content}
									</div>
								</div>
							))}
							{loading && (
								<div className="flex justify-start">
									<div className="bg-gray-100 p-4 rounded-lg">
										<span className="animate-pulse">Думаю...</span>
									</div>
								</div>
							)}
						</div>
						<div className="flex gap-2">
							<input
								type="text"
								className="input flex-grow"
								placeholder="Опишите, что хотите увидеть..."
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSend()}
							/>
							<button
								onClick={handleSend}
								className="btn-primary"
								disabled={loading}
							>
								Отправить
							</button>
						</div>
					</div>
				</div>

				{/* Quick questions */}
				<div className="space-y-4">
					<div className="card p-6">
						<h3 className="font-semibold mb-4">Быстрые вопросы</h3>
						<div className="space-y-2">
							{[
								"Покажи экскурсии с дегустацией",
								"Что-нибудь для школьников",
								"Бесплатные экскурсии",
								"Для студентов 18+",
							].map((q, i) => (
								<button
									key={i}
									onClick={() => setInput(q)}
									className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
								>
									{q}
								</button>
							))}
						</div>
					</div>

					{recommendations.length > 0 && (
						<div className="card p-6">
							<h3 className="font-semibold mb-4">Рекомендации</h3>
							<div className="space-y-2">
								{recommendations.map((id) => (
									<Link
										key={id}
										to={`/tour/${id}`}
										className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
									>
										Экскурсия #{id}
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Admin Dashboard
function AdminDashboard() {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("overview");
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user?.role !== "admin") {
			return;
		}
		loadData();
	}, [activeTab]);

	const loadData = async () => {
		setLoading(true);
		try {
			if (activeTab === "overview") {
				const analyticsData = await analytics.global();
				setData(analyticsData);
			}
		} catch (err) {
			console.error("Load error:", err);
		} finally {
			setLoading(false);
		}
	};

	if (user?.role !== "admin") {
		return <div className="container mx-auto px-4 py-8">Доступ запрещён</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

			<div className="flex gap-2 mb-8">
				{["overview", "users", "bookings", "settings"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-4 py-2 rounded-lg ${
							activeTab === tab ? "bg-primary-orange text-white" : "bg-gray-100"
						}`}
					>
						{tab === "overview"
							? "Обзор"
							: tab === "users"
								? "Пользователи"
								: tab === "bookings"
									? "Заявки"
									: "Настройки"}
					</button>
				))}
			</div>

			{loading ? (
				<div className="animate-pulse">
					<div className="h-64 bg-gray-200 rounded-xl"></div>
				</div>
			) : (
				activeTab === "overview" &&
				data && (
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="card p-6">
							<div className="text-3xl font-bold text-primary-orange mb-1">
								{data.overview?.enterprises || 0}
							</div>
							<div className="text-gray-500">Предприятий</div>
						</div>
						<div className="card p-6">
							<div className="text-3xl font-bold text-industrial-blue mb-1">
								{data.overview?.tours || 0}
							</div>
							<div className="text-gray-500">Экскурсий</div>
						</div>
						<div className="card p-6">
							<div className="text-3xl font-bold text-green-600 mb-1">
								{data.overview?.bookings || 0}
							</div>
							<div className="text-gray-500">Заявок</div>
						</div>
						<div className="card p-6">
							<div className="text-3xl font-bold text-purple-600 mb-1">
								{data.overview?.users || 0}
							</div>
							<div className="text-gray-500">Пользователей</div>
						</div>
					</div>
				)
			)}
		</div>
	);
}

// Main App
function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<div className="min-h-screen bg-bg-main">
					<Header />
					<main>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/catalog" element={<Catalog />} />
							<Route path="/enterprise/:id" element={<Enterprise />} />
							<Route path="/tour/:id" element={<Tour />} />
							<Route path="/bookings" element={<MyBookings />} />
							<Route path="/compare" element={<Compare />} />
							<Route path="/assistant" element={<Assistant />} />
							<Route path="/admin" element={<AdminDashboard />} />
						</Routes>
					</main>
					<footer className="bg-gray-900 text-white py-8 mt-12">
						<div className="container mx-auto px-4 text-center">
							<p>© 2026 ПромОриентир — Платформа промышленного туризма</p>
						</div>
					</footer>
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
