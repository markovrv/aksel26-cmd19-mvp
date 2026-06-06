import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { enterprises } from "../../api";

export default function Enterprise() {
	const { id } = useParams();
	const [enterprise, setEnterprise] = useState(null);
	const [activeTab, setActiveTab] = useState("about");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		loadEnterprise();
	}, [id]);

	const loadEnterprise = async () => {
		try {
			const data = await enterprises.get(id);
			setEnterprise(data.enterprise);
		} catch (err) {
			setError("Ошибка загрузки предприятия");
		} finally {
			setLoading(false);
		}
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

	const getDurationLabel = (duration) => {
		const labels = {
			"1h": "1 час",
			"2h": "2 часа",
			half_day: "Полдня",
			full_day: "Полный день",
		};
		return labels[duration] || duration;
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
					<div className="h-64 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (error || !enterprise) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="card p-12 text-center">
					<div className="text-6xl mb-4">😕</div>
					<h2 className="text-xl font-semibold mb-2">Предприятие не найдено</h2>
					<Link to="/catalog" className="btn-primary mt-4">
						Вернуться в каталог
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
				<Link to="/">Главная</Link>
				<span>/</span>
				<Link to="/catalog">Каталог</Link>
				<span>/</span>
				<span className="text-gray-900">{enterprise.name}</span>
			</nav>

			{/* Header */}
			<div className="card p-8 mb-8 border-l-4 border-l-primary-orange">
				<div className="flex items-start gap-6">
					<span className="text-6xl">
						{getProductionIcon(enterprise.production_type)}
					</span>
					<div className="flex-grow">
						<div className="flex items-center gap-3 mb-2">
							<h1 className="text-2xl md:text-3xl font-bold">
								{enterprise.name}
							</h1>
							<span className="badge badge-blue">
								{enterprise.production_type}
							</span>
						</div>
						<div className="flex flex-wrap gap-4 text-gray-600 mb-4">
							<span className="flex items-center gap-1">
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
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
								</svg>
								{enterprise.region}
							</span>
							{enterprise.address && <span>{enterprise.address}</span>}
						</div>
						{enterprise.tags?.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{enterprise.tags.map((tag, i) => (
									<span key={i} className="badge bg-gray-100 text-gray-700">
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 mb-6 border-b">
				{["about", "myth", "prof", "tours"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-6 py-3 font-medium transition-colors border-b-2 ${
							activeTab === tab
								? "border-primary-orange text-primary-orange"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						{tab === "about" && "О предприятии"}
						{tab === "myth" && "Миф и реальность"}
						{tab === "prof" && "Профориентация"}
						{tab === "tours" && `Экскурсии (${enterprise.tours?.length || 0})`}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className="grid lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					{activeTab === "about" && (
						<div className="space-y-6">
							{/* Description */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">Описание</h2>
								<div className="prose max-w-none text-gray-700 whitespace-pre-line">
									{enterprise.description || "Описание не указано"}
								</div>
							</div>

							{/* Video */}
							{enterprise.vk_video_url && (
								<div className="card p-6">
									<h2 className="text-xl font-semibold mb-4">
										Видео о предприятии
									</h2>
									<div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
										<iframe
											src={enterprise.vk_video_url}
											className="w-full h-full"
											allowFullScreen
											title="Video"
										/>
									</div>
								</div>
							)}

							{/* Photos */}
							{enterprise.vk_photos_url && (
								<div className="card p-6">
									<h2 className="text-xl font-semibold mb-4">Фотогалерея</h2>
									<div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
										<iframe
											src={`https://vk.com/widget_photos.php?oid=-102969270&album_id=0`}
											className="w-full h-full"
											title="Photos"
										/>
									</div>
								</div>
							)}

							{/* Links */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">Контакты</h2>
								<div className="space-y-2">
									{enterprise.site_url && (
										<a
											href={enterprise.site_url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-primary-blue hover:underline"
										>
											🌐 {enterprise.site_url}
										</a>
									)}
									{enterprise.vk_group_url && (
										<a
											href={enterprise.vk_group_url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-primary-blue hover:underline"
										>
											💬 {enterprise.vk_group_url}
										</a>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === "myth" && (
						<div className="space-y-6">
							{/* 360 Tour */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">360°-тур</h2>
								<div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
									{enterprise.has_360 ? (
										<div className="text-center">
											<div className="text-4xl mb-2">🔜</div>
											<p>Контент в разработке</p>
										</div>
									) : (
										<div className="text-center text-gray-400">
											<div className="text-4xl mb-2">🚫</div>
											<p>360°-тур не доступен</p>
										</div>
									)}
								</div>
							</div>

							{/* AR */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">AR-контент</h2>
								<div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
									{enterprise.has_ar ? (
										<div className="text-center">
											<div className="text-4xl mb-2">🔜</div>
											<p>AR-контент в разработке</p>
										</div>
									) : (
										<div className="text-center text-gray-400">
											<div className="text-4xl mb-2">🚫</div>
											<p>AR-контент не доступен</p>
										</div>
									)}
								</div>
							</div>

							{/* Live Stats */}
							{enterprise.live_stats && (
								<div className="card p-6">
									<h2 className="text-xl font-semibold mb-4">
										Живая статистика
									</h2>
									<div className="grid grid-cols-3 gap-4">
										<div className="text-center p-4 bg-gray-50 rounded-lg">
											<div className="text-2xl mb-1">🔊</div>
											<div className="text-2xl font-bold text-primary-orange">
												{enterprise.live_stats.noise_db || "—"}
											</div>
											<div className="text-sm text-gray-500">дБ (шум)</div>
										</div>
										<div className="text-center p-4 bg-gray-50 rounded-lg">
											<div className="text-2xl mb-1">🏭</div>
											<div className="text-2xl font-bold text-primary-blue">
												{enterprise.live_stats.emissions_tons || "—"}
											</div>
											<div className="text-sm text-gray-500">
												тонн (выбросы)
											</div>
										</div>
										<div className="text-center p-4 bg-gray-50 rounded-lg">
											<div className="text-2xl mb-1">⚠️</div>
											<div className="text-2xl font-bold text-green-600">
												{enterprise.live_stats.accidents_5y || "—"}
											</div>
											<div className="text-sm text-gray-500">за 5 лет</div>
										</div>
									</div>
								</div>
							)}

							{/* Certifications */}
							{enterprise.certifications?.length > 0 && (
								<div className="card p-6">
									<h2 className="text-xl font-semibold mb-4">Сертификаты</h2>
									<div className="flex flex-wrap gap-3">
										{enterprise.certifications.map((cert, i) => (
											<div
												key={i}
												className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg"
											>
												<span className="text-xl">✓</span>
												<div>
													<div className="font-medium">{cert.name}</div>
													<div className="text-sm text-gray-500">
														{cert.year}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Souvenirs */}
							{enterprise.souvenirs?.length > 0 && (
								<div className="card p-6">
									<h2 className="text-xl font-semibold mb-4">
										Сувенирная продукция
									</h2>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										{enterprise.souvenirs.map((souvenir, i) => (
											<div
												key={i}
												className="bg-gray-50 rounded-lg p-4 text-center"
											>
												<div className="text-4xl mb-2">🎁</div>
												<div className="font-medium">{souvenir.name}</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === "prof" && (
						<div className="space-y-6">
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">
									Профессии на предприятии
								</h2>
								{enterprise.professions?.length > 0 ? (
									<div className="space-y-4">
										{enterprise.professions.map((prof, i) => (
											<div
												key={i}
												className="border border-gray-200 rounded-lg p-4"
											>
												<h3 className="font-semibold mb-2">{prof.name}</h3>
												<div className="flex flex-wrap gap-2">
													{prof.skills?.map((skill, j) => (
														<span
															key={j}
															className="badge bg-gray-100 text-gray-700"
														>
															{skill}
														</span>
													))}
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-gray-500">Информация не указана</p>
								)}
							</div>
						</div>
					)}

					{activeTab === "tours" && (
						<div className="space-y-4">
							{enterprise.tours?.length > 0 ? (
								enterprise.tours.map((tour) => (
									<div
										key={tour.id}
										className="card p-6 border-l-4 border-l-primary-orange"
									>
										<div className="flex items-start justify-between mb-4">
											<div>
												<h3 className="text-xl font-semibold mb-1">
													{tour.title}
												</h3>
												<div className="flex items-center gap-3 text-sm text-gray-600">
													<span>⏱ {getDurationLabel(tour.duration)}</span>
													<span>👥 до {tour.max_group_size}</span>
													{tour.cost === 0 ? (
														<span className="badge badge-green">Бесплатно</span>
													) : (
														<span className="font-semibold text-primary-orange">
															{tour.cost} ₽
														</span>
													)}
												</div>
											</div>
											<Link to={`/tour/${tour.id}`} className="btn-primary">
												Записаться
											</Link>
										</div>
										<p className="text-gray-600">{tour.description}</p>
									</div>
								))
							) : (
								<div className="card p-12 text-center">
									<div className="text-6xl mb-4">📭</div>
									<h2 className="text-xl font-semibold mb-2">
										Нет доступных экскурсий
									</h2>
									<p className="text-gray-500">
										Скоро здесь появятся экскурсии
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<aside className="lg:col-span-1">
					<div className="card p-6 sticky top-24">
						<h3 className="text-lg font-semibold mb-4">Быстрая запись</h3>
						{enterprise.tours?.[0] && (
							<Link
								to={`/tour/${enterprise.tours[0].id}`}
								className="btn-primary w-full text-center block mb-4"
							>
								Записаться на экскурсию
							</Link>
						)}
						<button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
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
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
								/>
							</svg>
							Поделиться
						</button>
					</div>
				</aside>
			</div>
		</div>
	);
}
