import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Compare() {
	const navigate = useNavigate();
	const [compareList, setCompareList] = useState([]);

	useEffect(() => {
		const saved = sessionStorage.getItem("compareList");
		if (saved) {
			try {
				const list = JSON.parse(saved);
				if (list.length >= 2) {
					setCompareList(list);
				} else {
					navigate("/catalog");
				}
			} catch (e) {
				navigate("/catalog");
			}
		} else {
			navigate("/catalog");
		}
	}, [navigate]);

	const removeFromCompare = (id) => {
		const newList = compareList.filter((t) => t.id !== id);
		setCompareList(newList);
		sessionStorage.setItem("compareList", JSON.stringify(newList));
		if (newList.length < 2) {
			navigate("/catalog");
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

	const toursData = compareList;

	if (toursData.length === 0) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="text-center">
					<div className="animate-spin w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full mx-auto mb-4"></div>
					<p>Загрузка данных...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold mb-2">Сравнение экскурсий</h1>
					<p className="text-gray-600">
						Сравните {toursData.length} экскурсии по ключевым параметрам
					</p>
				</div>
				<Link to="/catalog" className="btn-secondary">
					Добавить ещё
				</Link>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full card">
					<thead>
						<tr className="border-b">
							<th className="text-left p-4 bg-gray-50 w-48">Параметр</th>
							{toursData.map((tour) => (
								<th key={tour.id} className="p-4 text-center min-w-[200px]">
									<div className="relative">
										<button
											onClick={() => removeFromCompare(tour.id)}
											className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
										>
											×
										</button>
										<h3 className="font-semibold mb-2">{tour.title}</h3>
										<p className="text-sm text-gray-500">
											{tour.enterprise_name}
										</p>
										<Link
											to={`/tour/${tour.id}`}
											className="btn-primary mt-2 inline-block text-sm"
										>
											Подробнее
										</Link>
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{/* Cost */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Стоимость</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.cost === 0 ? (
										<span className="badge badge-green">Бесплатно</span>
									) : (
										<span className="font-bold text-primary-orange">
											{tour.cost} ₽
										</span>
									)}
								</td>
							))}
						</tr>

						{/* Duration */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Длительность</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{getDurationLabel(tour.duration)}
								</td>
							))}
						</tr>

						{/* Group Size */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Размер группы</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									до {tour.max_group_size} чел.
								</td>
							))}
						</tr>

						{/* Min Age */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Возраст</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.min_age === "6plus"
										? "6+"
										: tour.min_age === "12plus"
											? "12+"
											: "18+"}
								</td>
							))}
						</tr>

						{/* Interactivity */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Интерактивность</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4">
									<div className="flex items-center gap-2">
										<div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-primary-orange rounded-full"
												style={{ width: `${tour.interactivity_level * 10}%` }}
											></div>
										</div>
										<span className="font-medium w-8">
											{tour.interactivity_level}/10
										</span>
									</div>
								</td>
							))}
						</tr>

						{/* Physical Load */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">
								Физическая нагрузка
							</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4">
									<div className="flex items-center gap-2">
										<div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-blue-500 rounded-full"
												style={{ width: `${tour.physical_load * 10}%` }}
											></div>
										</div>
										<span className="font-medium w-8">
											{tour.physical_load}/10
										</span>
									</div>
								</td>
							))}
						</tr>

						{/* Features */}
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Питание</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.food_on_site ? "✓" : "—"}
								</td>
							))}
						</tr>
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Сувениры</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.has_souvenirs ? "✓" : "—"}
								</td>
							))}
						</tr>
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Дегустация</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.has_degustation ? "✓" : "—"}
								</td>
							))}
						</tr>
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">Фото-зоны</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.has_photo_spots ? "✓" : "—"}
								</td>
							))}
						</tr>
						<tr className="border-b">
							<td className="p-4 font-medium bg-gray-50">СИЗ</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									{tour.ppe_required ? "🦺 Обязательно" : "—"}
								</td>
							))}
						</tr>

						{/* 🏆 Бонусная шкала */}
						<tr className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
							<td className="p-4 font-medium">🏆 Бонусная шкала</td>
							{toursData.map((tour) => {
								const bonusPoints = (tour.has_souvenirs ? 25 : 0) +
									(tour.has_degustation ? 30 : 0) +
									(tour.has_photo_spots ? 20 : 0) +
									(tour.food_on_site ? 15 : 0) +
									(tour.interactivity_level >= 8 ? 10 : 0);
								const maxBonus = 100;
								return (
									<td key={tour.id} className="p-4 text-center">
										<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-lg shadow-md">
											{bonusPoints}
										</div>
										<div className="mt-2 h-2 bg-gray-200 rounded-full max-w-32 mx-auto overflow-hidden">
											<div
												className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
												style={{ width: `${Math.min(bonusPoints, maxBonus)}%` }}
											></div>
										</div>
										<div className="text-xs text-gray-500 mt-1">
											{(tour.has_souvenirs ? "🎁 " : "")}
											{(tour.has_degustation ? "🍬 " : "")}
											{(tour.has_photo_spots ? "📸 " : "")}
											{(tour.food_on_site ? "🍽️" : "")}
										</div>
										<div className="text-xs text-gray-400 mt-1">
											{bonusPoints >= 70 ? "🔥 Супер" :
											 bonusPoints >= 40 ? "👍 Хорошо" :
											 bonusPoints >= 20 ? "👌 Средне" : "—"}
										</div>
									</td>
								);
							})}
						</tr>

						{/* Type */}
						<tr>
							<td className="p-4 font-medium bg-gray-50">Тип производства</td>
							{toursData.map((tour) => (
								<td key={tour.id} className="p-4 text-center">
									<span className="badge badge-blue">
										{tour.production_type}
									</span>
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>

			{/* Action */}
			<div className="mt-8 text-center">
				<Link to="/catalog" className="btn-secondary">
					Вернуться в каталог
				</Link>
			</div>
		</div>
	);
}