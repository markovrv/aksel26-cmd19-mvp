import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { enterprises, tours } from "../../api";
import { useToast } from "../../context/ToastContext";

const COST_LABELS = {
	free: { label: "Бесплатно", min: 0, max: 0 },
	cheap: { label: "До 500 ₽", min: 1, max: 500 },
	medium: { label: "500–1500 ₽", min: 500, max: 1500 },
	expensive: { label: "1500+ ₽", min: 1500, max: 999999 },
};

const DURATION_LABELS = {
	"1h": "1 час",
	"2h": "2 часа",
	half_day: "Полдня",
	full_day: "Полный день",
};

const GROUP_SIZE_OPTIONS = [
	{ value: "1-5", label: "1–5 человек" },
	{ value: "6-15", label: "6–15 человек" },
	{ value: "16-30", label: "16–30 человек" },
	{ value: "30+", label: "30+ человек" },
];

const PRODUCTION_ICONS = {
	Строительное: "🏗️",
	Пищевое: "🍬",
	Машиностроение: "⚙️",
	"Лёгкая промышленность": "🧵",
	"IT-производство": "💻",
	Энергетика: "⚡",
	Химическое: "🧪",
};

const ACCESSIBILITY_OPTIONS = [
	{ value: "vision", label: "Нарушения зрения" },
	{ value: "hearing", label: "Нарушения слуха" },
	{ value: "mobility", label: "Нарушения ОДА" },
];

const MIN_AGE_OPTIONS = [
	{ value: "6plus", label: "6+" },
	{ value: "12plus", label: "12+" },
	{ value: "18plus", label: "18+" },
];

export default function Catalog() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const regionFromUrl = searchParams.get("region");

	const [enterpriseList, setEnterpriseList] = useState([]);
	const [tourList, setTourList] = useState([]);
	const [filters, setFilters] = useState({});
	const [cascadeOptions, setCascadeOptions] = useState({});
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState("tours");
	const [compareList, setCompareList] = useState(() => {
		try {
			const saved = sessionStorage.getItem("compareList");
			return saved ? JSON.parse(saved) : [];
		} catch (e) { return []; }
	});
	const [regionFilter, setRegionFilter] = useState(regionFromUrl || "");

	useEffect(() => {
		if (regionFromUrl) {
			setRegionFilter(regionFromUrl);
		}
	}, [regionFromUrl]);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const [enterprisesData, toursData, cascadeData] = await Promise.all([
				enterprises.list(),
				tours.list(),
				tours.cascade(),
			]);
			setEnterpriseList(enterprisesData.enterprises || []);
			setTourList(toursData.tours || []);
			setCascadeOptions(cascadeData || {});
		} catch (err) {
			console.error("Error loading catalog:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleRegionChange = (region) => {
		setRegionFilter(region);
		// Обновляем URL
		if (region) {
			navigate(`/catalog?region=${encodeURIComponent(region)}`, { replace: true });
		} else {
			navigate("/catalog", { replace: true });
		}
	};

	const handleFilterChange = useCallback(async (key, value) => {
		const newFilters = { ...filters, [key]: value || undefined };
		Object.keys(newFilters).forEach((k) => {
			if (newFilters[k] === undefined || newFilters[k] === "") {
				delete newFilters[k];
			}
		});
		setFilters(newFilters);

		const apiParams = {};
		if (newFilters.duration) apiParams.duration = newFilters.duration;
		if (newFilters.production_type) apiParams.production_type = newFilters.production_type;
		if (newFilters.edu_program) apiParams.edu_program = newFilters.edu_program;
		if (newFilters.max_group_size) apiParams.max_group_size = newFilters.max_group_size;
		if (newFilters.accessibility) apiParams.accessibility = newFilters.accessibility;
		if (newFilters.min_age) apiParams.min_age = newFilters.min_age;
		if (newFilters.cost) {
			const range = COST_LABELS[newFilters.cost];
			if (range) {
				apiParams.min_cost = range.min;
				apiParams.max_cost = range.max;
			}
		}

		try {
			const [toursData, cascadeData] = await Promise.all([
				tours.list(apiParams),
				tours.cascade(apiParams),
			]);
			setTourList(toursData.tours || []);
			setCascadeOptions(cascadeData || {});
		} catch (err) {
			console.error("Filter error:", err);
		}
	}, [filters]);

	const isOptionAvailable = (key, value) => {
		const opt = cascadeOptions[key];
		if (!opt || !Array.isArray(opt) || opt.length === 0) return true;
		return opt.includes(value);
	};

	const toggleCompare = (tour) => {
		let updated;
		const exists = compareList.find((t) => t.id === tour.id);
		if (exists) {
			updated = compareList.filter((t) => t.id !== tour.id);
		} else {
			if (compareList.length >= 3) {
				alert("Можно сравнить максимум 3 экскурсии");
				return;
			}
			updated = [...compareList, tour];
		}
		setCompareList(updated);
		sessionStorage.setItem("compareList", JSON.stringify(updated));
	};

	const isInCompare = (tourId) => compareList.some((t) => t.id === tourId);

	const getDurationLabel = (duration) => DURATION_LABELS[duration] || duration;
	const getProductionIcon = (type) => PRODUCTION_ICONS[type] || "🏭";

	// Фильтрация по региону (локально, через enterpriseList)
	const regionNames = [...new Set(enterpriseList.map((e) => e.region))].sort();
	const filteredEnterprises = regionFilter
		? enterpriseList.filter((e) => e.region === regionFilter)
		: enterpriseList;
	const filteredTours = regionFilter
		? tourList.filter((t) => t.region === regionFilter)
		: tourList;

	const renderSelect = (label, key, options, valueKey = "value", labelKey = "label") => (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
			<select
				className="input"
				value={filters[key] || ""}
				onChange={(e) => handleFilterChange(key, e.target.value)}
			>
				<option value="">{label === "Длительность" ? "Любая" : label === "Стоимость" ? "Любая" : "Все"}</option>
				{options.map((opt) => {
					const val = typeof opt === "object" ? opt[valueKey] : opt;
					const lbl = typeof opt === "object" ? opt[labelKey] : opt;
					const available = isOptionAvailable(key === "cost" ? "cost_range" : `${key}s`, val);
					return (
						<option key={val} value={val} disabled={!available}>
							{lbl} {!available && " (нет)"}
						</option>
					);
				})}
			</select>
		</div>
	);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Каталог экскурсий</h1>
				<p className="text-gray-600">
					Найдите идеальную экскурсию по интересующим параметрам — фильтры автоматически подстраиваются
				</p>
				{regionFilter && (
					<div className="mt-2 inline-flex items-center gap-2 bg-primary-orange/10 text-primary-orange px-3 py-1.5 rounded-lg text-sm">
						📍 Регион: {regionFilter}
						<button onClick={() => handleRegionChange("")} className="ml-1 font-bold hover:text-red-600">&times;</button>
					</div>
				)}
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* Filters Sidebar */}
				<aside className="lg:w-80 flex-shrink-0">
					<div className="card p-6 sticky top-24">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">Фильтры</h2>
							<span className="text-sm text-gray-500">
								{filteredTours.length} найдено
							</span>
						</div>

						<div className="space-y-4">
							{/* Region Filter */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Регион</label>
								<select
									className="input"
									value={regionFilter}
									onChange={(e) => handleRegionChange(e.target.value)}
								>
									<option value="">Все регионы</option>
									{regionNames.map((r) => (
										<option key={r} value={r}>📍 {r}</option>
									))}
								</select>
							</div>

							{/* Duration */}
							{renderSelect(
								"Длительность",
								"duration",
								["1h", "2h", "half_day", "full_day"].map((d) => ({
									value: d,
									label: getDurationLabel(d),
								})),
							)}

							{/* Cost */}
							{renderSelect(
								"Стоимость",
								"cost",
								Object.entries(COST_LABELS).map(([k, v]) => ({
									value: k,
									label: v.label,
								})),
							)}

							{/* Production Type */}
							{renderSelect(
								"Тип производства",
								"production_type",
								(cascadeOptions.production_types || []).map((t) => ({
									value: t,
									label: `${getProductionIcon(t)} ${t}`,
								})),
							)}

							{/* Education Program */}
							{renderSelect(
								"Образовательная программа",
								"edu_program",
								(cascadeOptions.edu_programs || []).map((p) => ({
									value: p,
									label: p,
								})),
							)}

							{/* Group Size */}
							{renderSelect(
								"Размер группы",
								"max_group_size",
								GROUP_SIZE_OPTIONS,
							)}

							{/* Min Age */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Минимальный возраст</label>
								<select
									className="input"
									value={filters.min_age || ""}
									onChange={(e) => handleFilterChange("min_age", e.target.value)}
								>
									<option value="">Любой</option>
									{MIN_AGE_OPTIONS.map((opt) => {
										const available = isOptionAvailable("min_ages", opt.value);
										return (
											<option key={opt.value} value={opt.value} disabled={!available}>
												{opt.label} {!available && " (нет)"}
											</option>
										);
									})}
								</select>
							</div>

							{/* Accessibility */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Доступность для ОВЗ</label>
								<div className="space-y-2">
									{ACCESSIBILITY_OPTIONS.map((opt) => {
										const checked = filters.accessibility === opt.value;
										return (
											<label key={opt.value} className="flex items-center gap-2 cursor-pointer">
												<input
													type="checkbox"
													className="rounded text-primary-orange focus:ring-primary-orange"
													checked={checked}
													onChange={(e) => handleFilterChange("accessibility", e.target.checked ? opt.value : "")}
												/>
												<span className="text-sm text-gray-700">{opt.label}</span>
											</label>
										);
									})}
								</div>
							</div>

							{/* Reset */}
							<button
								onClick={() => {
									setFilters({});
									setRegionFilter("");
									navigate("/catalog", { replace: true });
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
								className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "tours" ? "bg-primary-orange text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
							>
								Экскурсии {viewMode === "tours" && `(${filteredTours.length})`}
							</button>
							<button
								onClick={() => setViewMode("enterprises")}
								className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "enterprises" ? "bg-primary-orange text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
							>
								Предприятия ({filteredEnterprises.length})
							</button>
						</div>

						{compareList.length > 0 && (
							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										if (compareList.length < 2) {
											alert("Выберите минимум 2 экскурсии для сравнения");
										} else {
											navigate("/compare");
										}
									}}
									className="btn-primary"
								>
									Сравнить ({compareList.length})
								</button>
								<button
									onClick={() => {
										setCompareList([]);
										sessionStorage.removeItem("compareList");
									}}
									className="px-3 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
									title="Очистить список сравнения"
								>
									🗑️
								</button>
							</div>
						)}
					</div>

					{/* Results */}
					{loading ? (
						<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="card p-6 animate-pulse">
									<div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
									<div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : viewMode === "tours" ? (
						<>
							{filteredTours.length === 0 ? (
								<div className="card p-12 text-center">
									<div className="text-6xl mb-4">🔍</div>
									<h2 className="text-xl font-semibold mb-2">Ничего не найдено</h2>
									<p className="text-gray-500">Попробуйте изменить параметры поиска</p>
								</div>
							) : (
								<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
									{filteredTours.map((tour) => (
										<div key={tour.id} className="card overflow-hidden border-l-4 flex flex-col"
											style={{ borderLeftColor: tour.production_type === "Пищевое" ? "#22C55E" : tour.production_type === "Машиностроение" ? "#EF4444" : tour.production_type === "IT-производство" ? "#8B5CF6" : tour.production_type === "Лёгкая промышленность" ? "#F59E0B" : tour.production_type === "Строительное" ? "#E05A00" : "#3B82F6" }}>
											<div className="p-6 flex flex-col flex-1">
												<div className="flex items-start justify-between mb-3">
													<div className="flex items-center gap-2">
														<span className="text-2xl">{getProductionIcon(tour.production_type)}</span>
														<span className="badge badge-blue text-xs">{tour.production_type}</span>
													</div>
													{tour.cost === 0 ? <span className="badge badge-green">Бесплатно</span> : <span className="font-semibold text-primary-orange">{tour.cost} ₽</span>}
												</div>
												<h3 className="text-lg font-semibold mb-2 line-clamp-2">{tour.title}</h3>
												<p className="text-sm text-gray-600 mb-3">📍 {tour.enterprise_name}</p>
												<div className="flex flex-wrap gap-2 mb-4">
													<span className="badge bg-gray-100 text-gray-700">⏱ {getDurationLabel(tour.duration)}</span>
													<span className="badge bg-gray-100 text-gray-700">👥 до {tour.max_group_size}</span>
													{tour.min_age && <span className="badge bg-gray-100 text-gray-700">{tour.min_age === "6plus" ? "6+" : tour.min_age === "12plus" ? "12+" : "18+"}</span>}
												</div>
												<div className="mb-4">
													<div className="flex items-center justify-between text-xs text-gray-500 mb-1"><span>Интерактивность</span><span>{tour.interactivity_level}/10</span></div>
													<div className="progress-bar"><div className="progress-fill bg-primary-orange" style={{ width: `${tour.interactivity_level * 10}%` }}></div></div>
												</div>
												<div className="mb-4">
													<div className="flex items-center justify-between text-xs text-gray-500 mb-1"><span>Нагрузка</span><span>{tour.physical_load}/10</span></div>
													<div className="progress-bar"><div className="progress-fill bg-industrial-blue" style={{ width: `${tour.physical_load * 10}%` }}></div></div>
												</div>
												<div className="flex flex-wrap gap-1 mb-4">
													<span className={`text-xs px-2 py-0.5 rounded ${tour.ppe_required ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-400"}`}>🦺 СИЗ</span>
													<span className={`text-xs px-2 py-0.5 rounded ${tour.food_on_site ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>🍽️ Еда</span>
													<span className={`text-xs px-2 py-0.5 rounded ${tour.has_souvenirs ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>🎁 Сувениры</span>
													<span className={`text-xs px-2 py-0.5 rounded ${tour.has_degustation ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>🍬 Дегустация</span>
													<span className={`text-xs px-2 py-0.5 rounded ${tour.has_photo_spots ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"}`}>📸 Фото</span>
												</div>
												<div className="flex gap-2 mt-auto pt-4">
													<Link to={`/tour/${tour.id}`} className="btn-primary flex-1 text-center">Подробнее</Link>
													<button
														onClick={() => toggleCompare(tour)}
														className={`px-3 py-2 rounded-lg transition-colors ${isInCompare(tour.id) ? "bg-primary-orange text-white border border-primary-orange" : "border border-gray-300 hover:bg-gray-50"}`}
														title={isInCompare(tour.id) ? "Убрать из сравнения" : "Добавить к сравнению"}
													>
														{isInCompare(tour.id) ? "✅" : "⚖️"}
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</>
					) : (
						<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
							{filteredEnterprises.map((enterprise) => (
								<Link key={enterprise.id} to={`/enterprise/${enterprise.id}`} className="card p-6 border-l-4 hover:shadow-lg transition-all"
									style={{ borderLeftColor: enterprise.production_type === "Пищевое" ? "#22C55E" : enterprise.production_type === "Машиностроение" ? "#EF4444" : enterprise.production_type === "IT-производство" ? "#8B5CF6" : "#E05A00" }}>
									<div className="flex items-start gap-4">
										<span className="text-4xl">{getProductionIcon(enterprise.production_type)}</span>
										<div className="flex-grow">
											<h3 className="text-lg font-semibold mb-1">{enterprise.name}</h3>
											<p className="text-sm text-gray-500 mb-2">📍 {enterprise.region}</p>
											<div className="flex items-center gap-2">
												<span className="badge badge-blue">{enterprise.production_type}</span>
												{enterprise.tours?.length > 0 && <span className="text-sm text-gray-500">{enterprise.tours.length} экскурсий</span>}
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}