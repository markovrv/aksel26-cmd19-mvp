import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { places } from "../../api";

export default function BookingSuccess() {
	const location = useLocation();
	const [nearbyPlaces, setNearbyPlaces] = useState({});
	const [loading, setLoading] = useState(true);
	const tourData = location.state?.tour || {};
	const region = tourData.region || "";

	useEffect(() => {
		if (region) {
			places
				.list({ region })
				.then((data) => {
					if (data.grouped) setNearbyPlaces(data.grouped);
					else if (data.places) {
						// Group by type
						const grouped = {};
						data.places.forEach((p) => {
							if (!grouped[p.type]) grouped[p.type] = [];
							grouped[p.type].push(p);
						});
						setNearbyPlaces(grouped);
					}
				})
				.catch(() => {})
				.finally(() => setLoading(false));
		} else {
			// Load all places
			places
				.list()
				.then((data) => {
					const grouped = {};
					(data.places || []).forEach((p) => {
						if (!grouped[p.type]) grouped[p.type] = [];
						grouped[p.type].push(p);
					});
					setNearbyPlaces(grouped);
				})
				.catch(() => {})
				.finally(() => setLoading(false));
		}
	}, [region]);

	const typeIcons = {
		hotel: "🏨",
		restaurant: "🍽️",
		museum: "🏛️",
		theatre: "🎭",
		park: "🌳",
		mall: "🛒",
	};
	const typeLabels = {
		hotel: "Гостиницы",
		restaurant: "Рестораны и кафе",
		museum: "Музеи",
		theatre: "Театры",
		park: "Парки",
		mall: "ТРЦ",
	};

	return (
		<div className="container mx-auto px-4 py-12">
			{/* Success Message */}
			<div className="card p-8 max-w-lg mx-auto text-center mb-8">
				<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg
						className="w-10 h-10 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h1 className="text-2xl font-bold mb-2">Заявка успешно отправлена!</h1>
				<p className="text-gray-600 mb-6">
					Ваша заявка принята. Предприятие свяжется с вами для подтверждения.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Link to="/bookings" className="btn-primary">
						📋 Мои заявки
					</Link>
					<Link to="/catalog" className="btn-secondary">
						🎯 Ещё экскурсии
					</Link>
				</div>
			</div>

			{/* Промышленная миля — Nearby Places */}
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold mb-2">🗺️ Промышленная миля</h2>
					<p className="text-gray-600">
						Спланируйте полный маршрут: завод → обед → досуг → ночлег
						{region && <> в регионе <strong>{region}</strong></>}
					</p>
				</div>

				{loading ? (
					<div className="grid md:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="card p-6 animate-pulse">
								<div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-1/2"></div>
							</div>
						))}
					</div>
				) : Object.keys(nearbyPlaces).length === 0 ? (
					<div className="card p-12 text-center">
						<div className="text-6xl mb-4">🗺️</div>
						<p className="text-gray-500">
							Информация о местах рядом загружается. Попробуйте вернуться позже.
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{/* Размещение */}
						{nearbyPlaces.hotel?.length > 0 && (
							<div className="card p-6">
								<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
									🏨 Гостиницы и отели
									<span className="text-sm text-gray-500 font-normal">({nearbyPlaces.hotel.length})</span>
								</h3>
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
									{nearbyPlaces.hotel.map((item) => (
										<PlaceCard key={item.id} item={item} icon="🏨" />
									))}
								</div>
							</div>
						)}

						{/* Питание */}
						{nearbyPlaces.restaurant?.length > 0 && (
							<div className="card p-6">
								<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
									🍽️ Рестораны и кафе
									<span className="text-sm text-gray-500 font-normal">({nearbyPlaces.restaurant.length})</span>
								</h3>
								<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
									{nearbyPlaces.restaurant.map((item) => (
										<PlaceCard key={item.id} item={item} icon="🍽️" />
									))}
								</div>
							</div>
						)}

						{/* Досуг */}
						{(["museum", "theatre", "park", "mall"]).filter((t) => (nearbyPlaces[t]?.length || 0) > 0).length > 0 && (
							<div className="card p-6">
								<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
									🎯 Досуг и развлечения
								</h3>
								<div className="space-y-6">
									{["museum", "theatre", "park", "mall"].map((type) =>
										nearbyPlaces[type]?.length > 0 ? (
											<div key={type}>
												<h4 className="font-medium text-sm text-gray-500 mb-3 flex items-center gap-1">
													{typeIcons[type]} {typeLabels[type]}
													<span className="font-normal">({nearbyPlaces[type].length})</span>
												</h4>
												<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
													{nearbyPlaces[type].map((item) => (
														<PlaceCard key={item.id} item={item} icon={typeIcons[type]} />
													))}
												</div>
											</div>
										) : null
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function PlaceCard({ item, icon }) {
	return (
		<div className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
			<div className="flex items-start gap-3">
				<span className="text-2xl">{icon}</span>
				<div className="min-w-0 flex-1">
					<h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
					{item.address && (
						<p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.address}</p>
					)}
					{(item.site_url || item.vk_url) && (
						<div className="flex gap-2 mt-2">
							{item.site_url && (
								<a
									href={item.site_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary-orange hover:underline"
								>
									🌐 Сайт
								</a>
							)}
							{item.vk_url && (
								<a
									href={item.vk_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-blue-600 hover:underline"
								>
									💬 VK
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}