import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { tours, bookings, places } from "../../api";

export default function Tour() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [tour, setTour] = useState(null);
	const [nearbyPlaces, setNearbyPlaces] = useState({});
	const [loading, setLoading] = useState(true);
	const [showBookingForm, setShowBookingForm] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(false);
	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		group_size: 1,
		desired_date: "",
		special_needs: "",
		accessibility_needs: [],
		tb_accepted: false,
	});

	useEffect(() => {
		loadTour();
	}, [id]);

	const loadTour = async () => {
		try {
			const data = await tours.get(id);
			setTour(data.tour);

			// Load nearby places if tour is loaded
			if (data.tour?.region) {
				const placesData = await places.list({ region: data.tour.region });
				setNearbyPlaces(placesData.grouped || {});
			}
		} catch (err) {
			console.error("Error loading tour:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.tb_accepted) {
			alert("Необходимо принять условия безопасности");
			return;
		}

		setSubmitting(true);
		try {
			await bookings.create({
				tour_id: parseInt(id),
				...formData,
			});
			setBookingSuccess(true);
			setTimeout(() => navigate("/booking-success"), 1500);
		} catch (err) {
			alert(err.message || "Ошибка отправки заявки");
		} finally {
			setSubmitting(false);
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

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
					<div className="h-64 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (!tour) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="card p-12 text-center">
					<h2 className="text-xl font-semibold mb-2">Экскурсия не найдена</h2>
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
				<Link to={`/enterprise/${tour.enterprise_id}`}>
					{tour.enterprise_name}
				</Link>
				<span>/</span>
				<span className="text-gray-900">Экскурсия</span>
			</nav>

			<div className="grid lg:grid-cols-3 gap-8">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Header */}
					<div className="card p-8">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h1 className="text-2xl md:text-3xl font-bold mb-2">
									{tour.title}
								</h1>
								<p className="text-gray-600">
									<Link
										to={`/enterprise/${tour.enterprise_id}`}
										className="text-primary-blue hover:underline"
									>
										{tour.enterprise_name}
									</Link>
									{tour.region && ` • ${tour.region}`}
								</p>
							</div>
							<div className="text-right">
								{tour.cost === 0 ? (
									<span className="text-2xl font-bold text-green-600">
										Бесплатно
									</span>
								) : (
									<span className="text-2xl font-bold text-primary-orange">
										{tour.cost} ₽
									</span>
								)}
							</div>
						</div>
						<p className="text-gray-700">{tour.description}</p>
					</div>

					{/* Details Grid */}
					<div className="card p-6">
						<h2 className="text-xl font-semibold mb-4">Подробности</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl mb-1">⏱</div>
								<div className="font-semibold">
									{getDurationLabel(tour.duration)}
								</div>
								<div className="text-sm text-gray-500">Длительность</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl mb-1">👥</div>
								<div className="font-semibold">до {tour.max_group_size}</div>
								<div className="text-sm text-gray-500">Группа</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl mb-1">🎂</div>
								<div className="font-semibold">
									{tour.min_age === "6plus"
										? "6+"
										: tour.min_age === "12plus"
											? "12+"
											: "18+"}{" "}
									лет
								</div>
								<div className="text-sm text-gray-500">Возраст</div>
							</div>
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="text-2xl mb-1">📊</div>
								<div className="font-semibold">
									{tour.interactivity_level}/10
								</div>
								<div className="text-sm text-gray-500">Интерактивность</div>
							</div>
						</div>

						{/* Progress Bars */}
						<div className="space-y-4">
							<div>
								<div className="flex justify-between text-sm mb-1">
									<span>Уровень интерактивности</span>
									<span>{tour.interactivity_level}/10</span>
								</div>
								<div className="progress-bar">
									<div
										className="progress-fill bg-primary-orange"
										style={{ width: `${tour.interactivity_level * 10}%` }}
									></div>
								</div>
							</div>
							<div>
								<div className="flex justify-between text-sm mb-1">
									<span>Физическая нагрузка</span>
									<span>{tour.physical_load}/10</span>
								</div>
								<div className="progress-bar">
									<div
										className="progress-fill bg-blue-500"
										style={{ width: `${tour.physical_load * 10}%` }}
									></div>
								</div>
							</div>
						</div>
					</div>

					{/* Features */}
					<div className="card p-6">
						<h2 className="text-xl font-semibold mb-4">Особенности</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{tour.ppe_required && (
								<div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
									<span>🦺</span> СИЗ обязательно
								</div>
							)}
							{tour.food_on_site && (
								<div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
									<span>🍽️</span> Питание включено
								</div>
							)}
							{tour.has_souvenirs && (
								<div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
									<span>🎁</span> Сувениры
								</div>
							)}
							{tour.has_degustation && (
								<div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
									<span>🍬</span> Дегустация
								</div>
							)}
							{tour.has_photo_spots && (
								<div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-lg">
									<span>📸</span> Фото-зоны
								</div>
							)}
						</div>
					</div>

					{/* Tags */}
					{tour.tags?.length > 0 && (
						<div className="card p-6">
							<h2 className="text-xl font-semibold mb-4">Теги</h2>
							<div className="flex flex-wrap gap-2">
								{tour.tags.map((tag, i) => (
									<span key={i} className="badge bg-gray-100 text-gray-700">
										{tag}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Safety */}
					{tour.safety_instructions && (
						<div className="card p-6 bg-yellow-50 border border-yellow-200">
							<h2 className="text-xl font-semibold mb-4">
								📋 Инструкция по технике безопасности
							</h2>
							<p className="text-gray-700">{tour.safety_instructions}</p>
						</div>
					)}

					{/* Booking Form */}
					{showBookingForm ? (
						<div className="card p-6">
							<h2 className="text-xl font-semibold mb-6">Подать заявку</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											ФИО *
										</label>
										<input
											type="text"
											required
											className="input"
											value={formData.full_name}
											onChange={(e) =>
												setFormData({ ...formData, full_name: e.target.value })
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Email *
										</label>
										<input
											type="email"
											required
											className="input"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
										/>
									</div>
								</div>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											Телефон
										</label>
										<input
											type="tel"
											className="input"
											placeholder="89001234567"
											value={formData.phone}
											onChange={(e) =>
												setFormData({ ...formData, phone: e.target.value })
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Количество человек *
										</label>
										<input
											type="number"
											required
											min="1"
											max={tour.max_group_size}
											className="input"
											value={formData.group_size}
											onChange={(e) =>
												setFormData({
													...formData,
													group_size: parseInt(e.target.value),
												})
											}
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Желаемая дата
									</label>
									<input
										type="date"
										className="input"
										value={formData.desired_date}
										onChange={(e) =>
											setFormData({ ...formData, desired_date: e.target.value })
										}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Особые пожелания
									</label>
									<textarea
										className="input"
										rows={3}
										value={formData.special_needs}
										onChange={(e) =>
											setFormData({
												...formData,
												special_needs: e.target.value,
											})
										}
									/>
								</div>
								<label className="flex items-start gap-3">
									<input
										type="checkbox"
										required
										className="mt-1"
										checked={formData.tb_accepted}
										onChange={(e) =>
											setFormData({
												...formData,
												tb_accepted: e.target.checked,
											})
										}
									/>
									<span className="text-sm">
										Я ознакомлен(а) с инструкцией по технике безопасности и
										принимаю условия *
									</span>
								</label>
								<div className="flex gap-3">
									<button
										type="submit"
										disabled={submitting}
										className="btn-primary disabled:opacity-50"
									>
										{submitting ? "Отправка..." : "Отправить заявку"}
									</button>
									<button
										type="button"
										onClick={() => setShowBookingForm(false)}
										className="btn-secondary"
									>
										Отмена
									</button>
								</div>
							</form>
						</div>
					) : (
						<button
							onClick={() => setShowBookingForm(true)}
							className="btn-primary w-full py-4 text-lg"
						>
							Подать заявку
						</button>
					)}
				</div>

				{/* Sidebar */}
				<aside className="lg:col-span-1">
					<div className="card p-6 sticky top-24 space-y-6">
						<div>
							<h3 className="text-lg font-semibold mb-4">Ближайшие места</h3>
							{Object.keys(nearbyPlaces).length > 0 ? (
								<div className="space-y-4">
									{Object.entries(nearbyPlaces)
										.slice(0, 2)
										.map(([type, items]) => (
											<div key={type}>
												<h4 className="font-medium text-sm text-gray-500 mb-2">
													{type === "hotel" && "🏨 Гостиницы"}
													{type === "restaurant" && "🍽️ Рестораны"}
													{type === "museum" && "🏛️ Музеи"}
													{type === "theatre" && "🎭 Театры"}
													{type === "park" && "🌳 Парки"}
													{type === "mall" && "🛒 ТРЦ"}
												</h4>
												<div className="space-y-2">
													{items.slice(0, 3).map((item) => (
														<div
															key={item.id}
															className="text-sm p-2 bg-gray-50 rounded"
														>
															<div className="font-medium">{item.name}</div>
															<div className="text-gray-500">
																{item.address}
															</div>
														</div>
													))}
												</div>
											</div>
										))}
								</div>
							) : (
								<p className="text-gray-500 text-sm">Загрузка...</p>
							)}
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
