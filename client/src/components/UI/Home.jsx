import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { enterprises, tours, regions } from "../../api";
import RussiaMap from "../Map/RussiaMap";

const PANEL_WIDTH = 448; // w-[28rem] = 448px

export default function Home() {
	const navigate = useNavigate();
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [enterpriseList, setEnterpriseList] = useState([]);
	const [tourList, setTourList] = useState([]);
	const [regionInfoMap, setRegionInfoMap] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [entData, tourData, regionData] = await Promise.all([
				enterprises.list({ status: "published" }),
				tours.list({ status: "published" }),
				regions.list().catch(() => ({ regions: [] })),
			]);
			setEnterpriseList(entData.enterprises || []);
			setTourList(tourData.tours?.slice(0, 6) || []);
			// Build region info map from API response
			const infoMap = {};
			const regionArr = regionData.regions || [];
			for (const r of regionArr) {
				infoMap[r.name] = {
					video: r.video_url || "",
					title: r.title || r.name,
					description: r.description || "",
				};
			}
			setRegionInfoMap(infoMap);
		} catch (err) {
			console.error("Error loading data:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleRegionSelect = (region) => {
		setSelectedRegion(region);
	};

	const handleEnterpriseSelect = (id) => {
		navigate(`/enterprise/${id}`);
	};

	const getProductionIcon = (type) => {
		const icons = { Строительное: "🏗️", Пищевое: "🍬", Машиностроение: "⚙️", "Лёгкая промышленность": "🧵", "IT-производство": "💻" };
		return icons[type] || "🏭";
	};

	const getDurationLabel = (duration) => {
		const labels = { "1h": "1 час", "2h": "2 часа", half_day: "Полдня", full_day: "Полный день" };
		return labels[duration] || duration;
	};

	const filteredEnterprises = selectedRegion ? enterpriseList.filter((e) => e.region === selectedRegion) : enterpriseList;
	const filteredTours = selectedRegion ? tourList.filter((t) => t.region === selectedRegion) : tourList;
	const regionInfo = selectedRegion ? regionInfoMap[selectedRegion] : null;

	return (
		<div>
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
				<div className="absolute inset-0 grid-pattern opacity-10"></div>
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
							Откройте мир{" "}
							<span className="text-primary-orange">промышленного туризма</span>
						</h1>
						<p className="text-xl text-gray-300 mb-8 leading-relaxed">Платформа для подбора, сравнения и бронирования экскурсий по предприятиям России.</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/catalog" className="btn-primary text-lg px-8 py-4">Исследовать каталог</Link>
							<Link to="/assistant" className="btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-4">Подобрать с AI</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Map Section */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl font-bold">Интерактивная карта</h2>
							<p className="text-gray-600 mt-2">Выберите регион на карте или из списка</p>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row gap-6">
						{/* Region List — слева от карты */}
						<div className="lg:w-56 flex-shrink-0">
							<div className="card p-4 overflow-y-auto max-h-[500px] sticky top-24">
								<h3 className="font-semibold text-sm mb-3">Регионы</h3>
								<div className="space-y-1">
									<button onClick={() => handleRegionSelect(null)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedRegion ? "bg-primary-orange text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
										🗺️ Вся Россия
									</button>
									{[...new Set(enterpriseList.map((e) => e.region))].map((region) => (
										<button key={region} onClick={() => handleRegionSelect(region)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedRegion === region ? "bg-primary-orange text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
											📍 {region}
											<span className="text-xs text-gray-500 ml-1">({enterpriseList.filter((e) => e.region === region).length})</span>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Карта + overlay региона */}
						<div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative">
							<RussiaMap
								selectedRegion={selectedRegion}
								onRegionSelect={handleRegionSelect}
								onEnterpriseSelect={handleEnterpriseSelect}
								panelWidth={selectedRegion ? PANEL_WIDTH : 0}
							/>

							{/* Панель региона — поверх карты, справа */}
							{selectedRegion && regionInfo && (
								<div className="absolute top-0 right-0 w-[28rem] h-full bg-white/95 backdrop-blur shadow-xl border-l border-gray-200 z-[1000] overflow-y-auto">
									<button onClick={() => handleRegionSelect(null)} className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-lg z-10">×</button>
									<div className="flex flex-col h-full">
										{regionInfo.video && (
											<div className="aspect-video bg-gray-900 flex-shrink-0">
												<iframe src={regionInfo.video} className="w-full h-full" allowFullScreen title="Region video" />
											</div>
										)}
										<div className="p-6 flex-1 flex flex-col justify-between">
											<div>
												<h3 className="text-xl font-bold mb-3">{regionInfo.title}</h3>
												<p className="text-gray-600 mb-4">{regionInfo.description}</p>
											</div>
											<div className="space-y-3">
												<div className="flex flex-wrap gap-3">
													<span className="text-sm bg-primary-orange/10 text-primary-orange px-3 py-1.5 rounded-lg font-medium">🏭 {filteredEnterprises.length} предприятий</span>
													<span className="text-sm bg-industrial-blue/10 text-industrial-blue px-3 py-1.5 rounded-lg font-medium">🎯 {filteredTours.length} экскурсий</span>
												</div>
												<Link to={`/catalog?region=${encodeURIComponent(selectedRegion)}`} className="btn-primary w-full text-center block">Смотреть экскурсии региона →</Link>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Catalog below map */}
			{selectedRegion && (
				<section className="py-12 bg-gray-50">
					<div className="container mx-auto px-4">
						<div className="flex items-center justify-between mb-8">
							<div><h2 className="text-2xl font-bold">Предприятия {selectedRegion}</h2><p className="text-gray-600 mt-1">{filteredEnterprises.length} предприятий и {filteredTours.length} экскурсий</p></div>
							<Link to="/catalog" className="text-primary-orange hover:underline font-medium">Все предприятия →</Link>
						</div>
						{loading ? (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map((i) => <div key={i} className="card p-6 animate-pulse"><div className="h-40 bg-gray-200 rounded-xl mb-4"></div><div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>)}</div>
						) : filteredEnterprises.length === 0 ? (
							<div className="card p-12 text-center"><div className="text-4xl mb-4">🏭</div><p className="text-gray-500">В этом регионе пока нет предприятий</p></div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredEnterprises.map((e) => (
									<Link key={e.id} to={`/enterprise/${e.id}`} className="card p-6 border-l-4 hover:shadow-lg transition-all" style={{ borderLeftColor: e.production_type === "Пищевое" ? "#22C55E" : e.production_type === "Машиностроение" ? "#EF4444" : e.production_type === "IT-производство" ? "#8B5CF6" : "#E05A00" }}>
										<div className="flex items-start gap-4">
											<span className="text-4xl">{getProductionIcon(e.production_type)}</span>
											<div className="flex-grow"><h3 className="text-lg font-semibold mb-1 line-clamp-1">{e.name}</h3><p className="text-sm text-gray-500 mb-2">📍 {e.region}</p><span className="badge badge-blue">{e.production_type}</span>{e.tours?.length > 0 && <span className="ml-2 badge badge-orange">{e.tours.length} экскурсий</span>}</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</div>
				</section>
			)}

			{/* Features */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="card p-8 text-center hover:shadow-lg transition-shadow"><div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6"><span className="text-3xl">🗺️</span></div><h3 className="text-xl font-semibold mb-3">Интерактивная карта</h3><p className="text-gray-600">Выбирайте регион на удобной карте России.</p></div>
						<div className="card p-8 text-center hover:shadow-lg transition-shadow"><div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6"><span className="text-3xl">🤖</span></div><h3 className="text-xl font-semibold mb-3">AI-ассистент</h3><p className="text-gray-600">Умный помощник подберёт идеальные экскурсии.</p></div>
						<div className="card p-8 text-center hover:shadow-lg transition-shadow"><div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6"><span className="text-3xl">⚖️</span></div><h3 className="text-xl font-semibold mb-3">Сравнение экскурсий</h3><p className="text-gray-600">Сравнивайте до 3 экскурсий по 10 параметрам.</p></div>
					</div>
				</div>
			</section>

			{/* Tour list (no region) */}
			{!selectedRegion && (
				<section className="py-16 bg-gray-50">
					<div className="container mx-auto px-4">
						<div className="flex items-center justify-between mb-8"><h2 className="text-3xl font-bold">Популярные экскурсии</h2><Link to="/catalog" className="text-primary-orange hover:underline font-medium">Все экскурсии →</Link></div>
						{loading ? (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map((i) => <div key={i} className="card p-6 animate-pulse"><div className="h-32 bg-gray-200 rounded-xl mb-4"></div><div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>)}</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredTours.slice(0, 6).map((t) => (
									<Link key={t.id} to={`/tour/${t.id}`} className="card p-6 hover:shadow-lg transition-shadow">
										<div className="flex items-start justify-between mb-3"><div><h3 className="text-lg font-semibold mb-1">{t.title}</h3><p className="text-sm text-gray-500">{t.enterprise_name}</p></div><span className="font-bold text-primary-orange">{t.cost === 0 ? "Бесплатно" : `${t.cost} ₽`}</span></div>
										<div className="flex flex-wrap gap-2 text-sm text-gray-600"><span>⏱ {getDurationLabel(t.duration)}</span><span>👥 до {t.max_group_size}</span><span className="badge badge-blue text-xs">{t.production_type}</span></div>
									</Link>
								))}
							</div>
						)}
					</div>
				</section>
			)}

			{/* CTA */}
			<section className="py-16 bg-industrial-blue text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Готовы к открытиям?</h2>
					<p className="text-xl opacity-80 mb-8">Присоединяйтесь к тысячам путешественников.</p>
					<Link to="/catalog" className="inline-block bg-white text-industrial-blue font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">Начать путешествие</Link>
				</div>
			</section>

		</div>
	);
}