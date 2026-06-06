import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookings } from "../../api";

export default function MyBookings() {
	const [bookingsList, setBookingsList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		loadBookings();
	}, []);

	const loadBookings = async () => {
		try {
			const data = await bookings.list();
			setBookingsList(data.bookings || []);
		} catch (err) {
			setError("Ошибка загрузки заявок");
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

	const handlePay = async (id) => {
		try {
			await bookings.pay(id);
			loadBookings();
		} catch (err) {
			alert("Ошибка оплаты");
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="animate-pulse space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="card p-6">
							<div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12">
			<h1 className="text-3xl font-bold mb-8">Мои заявки</h1>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
					{error}
				</div>
			)}

			{bookingsList.length === 0 ? (
				<div className="card p-12 text-center">
					<div className="text-6xl mb-4">📋</div>
					<h2 className="text-xl font-semibold mb-2">Заявок пока нет</h2>
					<p className="text-gray-500 mb-6">
						Вы еще не подали ни одной заявки на экскурсию
					</p>
					<Link to="/catalog" className="btn-primary">
						Выбрать экскурсию
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{bookingsList.map((booking) => (
						<div key={booking.id} className="card p-6">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="flex-grow">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="text-lg font-semibold">
											{booking.tour_title}
										</h3>
										<span
											className={`badge ${getStatusBadge(booking.status).class}`}
										>
											{getStatusBadge(booking.status).text}
										</span>
									</div>
									<div className="flex flex-wrap gap-4 text-sm text-gray-600">
										<span>📅 {booking.desired_date || "Дата не указана"}</span>
										<span>👥 {booking.group_size} человек</span>
										<span>📧 {booking.email}</span>
									</div>
									<p className="text-sm text-gray-500 mt-2">
										Подана:{" "}
										{new Date(booking.created_at).toLocaleDateString("ru-RU")}
									</p>
								</div>

								<div className="flex items-center gap-3">
									{booking.payment_status === "pending" &&
										booking.status !== "cancelled" && (
											<button
												onClick={() => handlePay(booking.id)}
												className="btn-primary"
											>
												Оплатить (тест)
											</button>
										)}
									{booking.payment_status === "paid" && (
										<span className="badge badge-green">Оплачено</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
