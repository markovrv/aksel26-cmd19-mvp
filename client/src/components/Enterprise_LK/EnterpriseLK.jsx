import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { enterprises, tours, bookings, analytics } from "../../api";

export default function EnterpriseLK() {
	const [activeTab, setActiveTab] = useState("overview");
	const [enterprise, setEnterprise] = useState(null);
	const [myTours, setMyTours] = useState([]);
	const [myBookings, setMyBookings] = useState([]);
	const [analyticsData, setAnalyticsData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, [activeTab]);

	const loadData = async () => {
		setLoading(true);
		try {
			if (activeTab === "overview") {
				const entData = await enterprises.list({ status: "published" });
				const ent = entData.enterprises?.find((e) => e.user_id); // Find own enterprise
				setEnterprise(ent);
				if (ent) {
					const toursData = await tours.list({ enterprise_id: ent.id });
					setMyTours(toursData.tours || []);
					const analyticsData = await analytics.enterprise(ent.id);
					setAnalyticsData(analyticsData);
				}
			} else if (activeTab === "bookings") {
				const bookingsData = await bookings.list();
				setMyBookings(bookingsData.bookings || []);
			}
		} catch (err) {
			console.error("Error loading LK data:", err);
		} finally {
			setLoading(false);
		}
	};

	const updateBookingStatus = async (id, status) => {
		try {
			await bookings.updateStatus(id, status);
			loadData();
		} catch (err) {
			alert("Ошибка обновления статуса");
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
			<h1 className="text-3xl font-bold mb-2">Личный кабинет предприятия</h1>
			<p className="text-gray-600 mb-8">Управление экскурсиями и заявками</p>

			{/* Tabs */}
			<div className="flex gap-2 mb-8">
				<button
					onClick={() => setActiveTab("overview")}
					className={`px-4 py-2 rounded-lg transition-colors ${
						activeTab === "overview"
							? "bg-primary-blue text-white"
							: "bg-gray-100"
					}`}
				>
					📊 Обзор
				</button>
				<button
					onClick={() => setActiveTab("bookings")}
					className={`px-4 py-2 rounded-lg transition-colors ${
						activeTab === "bookings"
							? "bg-primary-blue text-white"
							: "bg-gray-100"
					}`}
				>
					📋 Заявки
				</button>
			</div>

			{loading ? (
				<div className="animate-pulse">
					<div className="h-64 bg-gray-200 rounded-xl"></div>
				</div>
			) : (
				<>
					{/* Overview */}
					{activeTab === "overview" && (
						<div className="space-y-6">
							{/* Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="card p-6">
									<div className="text-3xl font-bold text-primary-orange">
										{myTours.length}
									</div>
									<div className="text-gray-500">Экскурсий</div>
								</div>
								<div className="card p-6">
									<div className="text-3xl font-bold text-primary-blue">
										{analyticsData?.tours_views?.reduce(
											(sum, t) => sum + t.views_count,
											0,
										) || 0}
									</div>
									<div className="text-gray-500">Всего просмотров</div>
								</div>
								<div className="card p-6">
									<div className="text-3xl font-bold text-green-600">
										{analyticsData?.bookings_by_tour?.reduce(
											(sum, t) => sum + t.total_bookings,
											0,
										) || 0}
									</div>
									<div className="text-gray-500">Заявок</div>
								</div>
								<div className="card p-6">
									<div className="text-3xl font-bold text-purple-600">
										{analyticsData?.bookings_by_tour?.filter(
											(t) => t.confirmed > 0,
										).length || 0}
									</div>
									<div className="text-gray-500">Подтверждённых</div>
								</div>
							</div>

							{/* Tours */}
							<div className="card p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Мои экскурсии</h2>
									<button className="btn-primary text-sm">
										+ Добавить экскурсию
									</button>
								</div>
								{myTours.length > 0 ? (
									<div className="space-y-3">
										{myTours.map((tour) => (
											<div
												key={tour.id}
												className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
											>
												<div>
													<div className="font-medium">{tour.title}</div>
													<div className="text-sm text-gray-500">
														{tour.cost === 0 ? "Бесплатно" : `${tour.cost} ₽`} •{" "}
														{tour.duration}
													</div>
												</div>
												<div className="flex items-center gap-4">
													<span className="text-gray-500">
														👁 {tour.views_count}
													</span>
													<span
														className={`badge ${
															tour.status === "published"
																? "badge-green"
																: "badge-orange"
														}`}
													>
														{tour.status}
													</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-gray-500">У вас пока нет экскурсий</p>
								)}
							</div>

							{/* Top Tours */}
							{analyticsData?.tours_views &&
								analyticsData.tours_views.length > 0 && (
									<div className="card p-6">
										<h2 className="text-xl font-semibold mb-4">
											Популярность экскурсий
										</h2>
										<div className="space-y-3">
											{analyticsData.tours_views.map((tour) => (
												<div key={tour.id}>
													<div className="flex justify-between text-sm mb-1">
														<span>{tour.title}</span>
														<span>{tour.views_count} просмотров</span>
													</div>
													<div className="progress-bar">
														<div
															className="progress-fill bg-primary-orange"
															style={{
																width: `${(tour.views_count / Math.max(...analyticsData.tours_views.map((t) => t.views_count))) * 100}%`,
															}}
														></div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
						</div>
					)}

					{/* Bookings */}
					{activeTab === "bookings" && (
						<div className="card overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="text-left p-4">Заявитель</th>
										<th className="text-left p-4">Email</th>
										<th className="text-left p-4">Дата</th>
										<th className="text-left p-4">Статус</th>
										<th className="text-left p-4">Действия</th>
									</tr>
								</thead>
								<tbody>
									{myBookings.map((booking) => (
										<tr key={booking.id} className="border-t">
											<td className="p-4">
												<div className="font-medium">{booking.full_name}</div>
												<div className="text-sm text-gray-500">
													Группа: {booking.group_size} чел.
												</div>
											</td>
											<td className="p-4">{booking.email}</td>
											<td className="p-4">
												{booking.desired_date || "Не указана"}
											</td>
											<td className="p-4">
												<span
													className={`badge ${getStatusBadge(booking.status).class}`}
												>
													{getStatusBadge(booking.status).text}
												</span>
											</td>
											<td className="p-4">
												<select
													className="input text-sm"
													value={booking.status}
													onChange={(e) =>
														updateBookingStatus(booking.id, e.target.value)
													}
												>
													<option value="new">Новая</option>
													<option value="reviewing">На рассмотрении</option>
													<option value="confirmed">Подтверждена</option>
													<option value="rejected">Отклонена</option>
												</select>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{myBookings.length === 0 && (
								<div className="p-12 text-center text-gray-500">
									Заявок пока нет
								</div>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
