import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { enterprises, tours } from "../../api";

export default function Catalog() {
	const [enterpriseList, setEnterpriseList] = useState([]);
	const [tourList, setTourList] = useState([]);
	const [filters, setFilters] = useState({});
	const [availableFilters, setAvailableFilters] = useState({});
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState("tours"); // 'tours' or 'enterprises'
	const [compareList, setCompareList] = useState([]);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const [enterprisesData, filtersData] = await Promise.all([
				enterprises.list(),
				tours.filters(),
			]);
			setEnterpriseList(enterprisesData.enterprises || []);
			setAvailableFilters(filtersData.filters || {});
		} catch (err) {
			console.error("Error loading catalog:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = async (key, value) => {
		const newFilters = { ...filters, [key]: value || undefined };
		setFilters(newFilters);

		// Load filtered tours
		try {
			const cleanFilters = Object.fromEntries(
				Object.entries(newFilters).filter(([_, v]) => v),
			);
			const data = await tours.list(cleanFilters);
			setTourList(data.tours || []);
		} catch (err) {
			console.error("Filter error:", err);
		}
	};

	const addToCompare = (tour) => {
		if (compareList.length >= 3) {
			alert("Можно сравнить максимум 3 экскурсии");
			return;
		}
		if (!compareList.find((t) => t.id === tour.id)) {
			setCompareList([...compareList, tour]);
		}
	};

	const getDurationLabel = (duration) => {
		const labels = {
			"1h": "1 час",
			"2h": "2 часа",
			half_day: "Полдня",
			full_day: "Полный день",
		};
		return labels[duration] || duration;
	};

	const getProductionIcon = (type) => {
		const icons = {
			Строительное: "🏗️",
			Пищевое: "🍬",
			Машиностроение: "⚙️",
			"Лёгкая промышленность": "🧵",
			"IT-производство": "💻",
			Энергетика: "⚡",
			Химическое: "🧪",
		};
		return icons[type] || "🏭";
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Каталог экскурсий</h1>
				<p className="text-gray-600">
					Найдите идеальную экскурсию по интересующим параметрам
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* Filters Sidebar */}
				<aside className="lg:w-72 flex-shrink-0">
					<div className="card p-6 sticky top-24">
						<h2 className="text-lg font-semibold mb-4">Фильтры</h2>

						<div className="space-y-4">
							{/* Duration */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Длительность
								</label>
								<select
									className="input"
									onChange={(e) =>
										handleFilterChange("duration", e.target.value)
									}
								>
									<option value="">Любая</option>
									<option value="1h">1 час</option>
									<option value="2h">2 часа</option>
									<option value="half_day">Полдня</option>
									<option value="full_day">Полный день</option>
								</select>
							</div>

							{/* Cost */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Стоимость
								</label>
								<select
									className="input"
									onChange={(e) => handleFilterChange("cost", e.target.value)}
								>
									<option value="">Любая</option>
									<option value="free">Бесплатно</option>
									<option value="cheap">До 500 ₽</option>
									<option value="medium">500-1500 ₽</option>
									<option value="expensive">1500+ ₽</option>
								</select>
							</div>

							{/* Production Type */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Тип производства
								</label>
								<select
									className="input"
									onChange={(e) =>
										handleFilterChange("production_type", e.target.value)
									}
								>
									<option value="">Все</option>
									{availableFilters.production_types?.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>

							{/* Education Program */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Образовательная программа
								</label>
								<select
									className="input"
									onChange={(e) =>
										handleFilterChange("edu_program", e.target.value)
									}
								>
									<option value="">Любая</option>
									{availableFilters.edu_programs?.map((program) => (
										<option key={program} value={program}>
											{program}
										</option>
									))}
								</select>
							</div>

							{/* Group Size */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Размер группы
								</label>
								<select
									className="input"
									onChange={(e) =>
										handleFilterChange("max_group_size", e.target.value)
									}
								>
									<option value="">Любой</option>
									<option value="1-5">1-5 человек</option>
									<option value="6-15">6-15 человек</option>
									<option value="16-30">16-30 человек</option>
									<option value="30+">30+ человек</option>
								</select>
							</div>

							{/* Accessibility */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Доступность ОВЗ
								</label>
								<div className="space-y-2">
									{["vision", "hearing", "mobility"].map((type) => (
										<label key={type} className="flex items-center gap-2">
											<input
												type="checkbox"
												className="rounded text-primary-blue"
												onChange={(e) => {
													// Handle accessibility filter
												}}
											/>
											<span className="text-sm">
												{type === "vision" && "Нарушения зрения"}
												{type === "hearing" && "Нарушения слуха"}
												{type === "mobility" && "Нарушения ОДА"}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Reset */}
							<button
								onClick={() => {
									setFilters({});
									loadData();
								}}
								className="w-full py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors"
							>
								Сбросить фильтры
							</button>
						</div>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-grow">
					{/* View Mode Toggle */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex gap-2">
							<button
								onClick={() => setViewMode("tours")}
								className={`px-4 py-2 rounded-lg transition-colors ${
									viewMode === "tours"
										? "bg-primary-blue text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								Экскурсии
							</button>
							<button
								onClick={() => setViewMode("enterprises")}
								className={`px-4 py-2 rounded-lg transition-colors ${
									viewMode === "enterprises"
										? "bg-primary-blue text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								Предприятия
							</button>
						</div>

						{compareList.length > 0 && (
							<Link to="/compare" className="btn-primary">
								Сравнить ({compareList.length})
							</Link>
						)}
					</div>

					{/* Results */}
					{loading ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="card p-6 animate-pulse">
									<div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
									<div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : viewMode === "tours" ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{tourList.map((tour) => (
								<div
									key={tour.id}
									className={`card overflow-hidden border-l-4 production-${tour.production_type?.toUpperCase()}`}
								>
									<div className="p-6">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-2">
												<span className="text-2xl">
													{getProductionIcon(tour.production_type)}
												</span>
												<span className="badge badge-blue text-xs">
													{tour.production_type}
												</span>
											</div>
											{tour.cost === 0 ? (
												<span className="badge badge-green">Бесплатно</span>
											) : (
												<span className="font-semibold text-primary-orange">
													{tour.cost} ₽
												</span>
											)}
										</div>

										<h3 className="text-lg font-semibold mb-2 line-clamp-2">
											{tour.title}
										</h3>
										<p className="text-sm text-gray-600 mb-3">
											к {tour.enterprise_name}
										</p>

										<div className="flex flex-wrap gap-2 mb-4">
											<span className="badge bg-gray-100 text-gray-700">
												⏱ {getDurationLabel(tour.duration)}
											</span>
											<span className="badge bg-gray-100 text-gray-700">
												👥 до {tour.max_group_size}
											</span>
											{tour.min_age && (
												<span className="badge bg-gray-100 text-gray-700">
													{tour.min_age === "6plus"
														? "6+"
														: tour.min_age === "12plus"
															? "12+"
															: "18+"}
												</span>
											)}
										</div>

										{/* Interactivity Bar */}
										<div className="mb-4">
											<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
												<span>Интерактивность</span>
												<span>{tour.interactivity_level}/10</span>
											</div>
											<div className="progress-bar">
												<div
													className="progress-fill bg-primary-orange"
													style={{ width: `${tour.interactivity_level * 10}%` }}
												></div>
											</div>
										</div>

										<div className="flex gap-2">
											<Link
												to={`/tour/${tour.id}`}
												className="btn-primary flex-grow text-center"
											>
												Подробнее
											</Link>
											<button
												onClick={() => addToCompare(tour)}
												className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
												title="Добавить к сравнению"
											>
												⚖️
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="grid md:grid-cols-2 gap-6">
							{enterpriseList.map((enterprise) => (
								<Link
									key={enterprise.id}
									to={`/enterprise/${enterprise.id}`}
									className={`card p-6 border-l-4 production-${enterprise.production_type?.toUpperCase()}`}
								>
									<div className="flex items-start gap-4">
										<span className="text-4xl">
											{getProductionIcon(enterprise.production_type)}
										</span>
										<div className="flex-grow">
											<h3 className="text-lg font-semibold mb-1">
												{enterprise.name}
											</h3>
											<p className="text-sm text-gray-500 mb-2">
												📍 {enterprise.region}
											</p>
											<div className="flex items-center gap-2">
												<span className="badge badge-blue">
													{enterprise.production_type}
												</span>
												{enterprise.tours_count > 0 && (
													<span className="text-sm text-gray-500">
														{enterprise.tours_count} экскурсий
													</span>
												)}
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}

					{!loading && tourList.length === 0 && enterpriseList.length === 0 && (
						<div className="card p-12 text-center">
							<div className="text-6xl mb-4">🔍</div>
							<h2 className="text-xl font-semibold mb-2">Ничего не найдено</h2>
							<p className="text-gray-500">
								Попробуйте изменить параметры поиска
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
