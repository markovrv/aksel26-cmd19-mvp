import React from "react";
import { Link } from "react-router-dom";

export default function BookingSuccess() {
	return (
		<div className="container mx-auto px-4 py-20">
			<div className="card p-12 max-w-lg mx-auto text-center">
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
				<h1 className="text-2xl font-bold mb-4">Заявка успешно отправлена!</h1>
				<p className="text-gray-600 mb-8">
					Ваша заявка принята. Предприятие свяжется с вами для подтверждения.
				</p>
				<div className="space-y-3">
					<Link to="/my-bookings" className="btn-primary w-full block">
						Мои заявки
					</Link>
					<Link to="/catalog" className="btn-secondary w-full block">
						Выбрать ещё экскурсию
					</Link>
				</div>
			</div>
		</div>
	);
}
