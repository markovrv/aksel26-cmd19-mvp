import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { enterprises } from "../../api";

export default function Home() {
	const [enterprisesList, setEnterprisesList] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadEnterprises();
	}, []);

	const loadEnterprises = async () => {
		try {
			const data = await enterprises.list({ status: "published" });
			setEnterprisesList(data.enterprises?.slice(0, 6) || []);
		} catch (err) {
			console.error("Error loading enterprises:", err);
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

	return (
		<div>
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-grid opacity-50"></div>
				<div className="container mx-auto px-4 py-20 relative z-10">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark mb-6 leading-tight">
							Откройте мир{" "}
							<span className="text-primary-orange">промышленного туризма</span>
						</h1>
						<p className="text-xl text-gray-600 mb-8 leading-relaxed">
							Платформа для подбора, сравнения и бронирования экскурсий по
							предприятиям России. Промышленные гиганты ждут вас!
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/catalog" className="btn-primary text-lg px-8 py-4">
								Исследовать каталог
							</Link>
							<Link to="/assistant" className="btn-secondary text-lg px-8 py-4">
								Подобрать экскурсию с AI
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">
						Возможности платформы
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="card p-8 text-center hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
								<span className="text-3xl">🗺️</span>
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Интерактивная карта
							</h3>
							<p className="text-gray-600">
								Выбирайте регион и находите интересные производства рядом с вами
								на удобной карте России.
							</p>
						</div>
						<div className="card p-8 text-center hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
								<span className="text-3xl">🤖</span>
							</div>
							<h3 className="text-xl font-semibold mb-3">AI-ассистент</h3>
							<p className="text-gray-600">
								Расскажите о своих интересах, и умный помощник подберёт
								идеальные экскурсии для вас.
							</p>
						</div>
						<div className="card p-8 text-center hover:shadow-lg transition-shadow">
							<div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
								<span className="text-3xl">⚖️</span>
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Сравнение экскурсий
							</h3>
							<p className="text-gray-600">
								Сравнивайте до 3 экскурсий по 10 параметрам и выбирайте лучшее
								для себя.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Popular Enterprises */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-3xl font-bold">Популярные предприятия</h2>
						<Link
							to="/catalog"
							className="text-primary-orange hover:underline font-medium"
						>
							Все предприятия →
						</Link>
					</div>

					{loading ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="card p-6 animate-pulse">
									<div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
									<div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							))}
						</div>
					) : (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{enterprisesList.map((enterprise) => (
								<Link
									key={enterprise.id}
									to={`/enterprise/${enterprise.id}`}
									className={`card p-6 border-l-4 hover:shadow-lg transition-all production-${enterprise.production_type?.toUpperCase()}`}
								>
									<div className="text-4xl mb-4">
										{getProductionIcon(enterprise.production_type)}
									</div>
									<h3 className="text-lg font-semibold mb-2 line-clamp-1">
										{enterprise.name}
									</h3>
									<div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
										<svg
											className="w-4 h-4"
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
									</div>
									<span className="badge badge-blue">
										{enterprise.production_type}
									</span>
									{enterprise.tours_count > 0 && (
										<span className="ml-2 badge badge-orange">
											{enterprise.tours_count} экскурсий
										</span>
									)}
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-primary-blue text-white">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Готовы к открытиям?</h2>
					<p className="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
						Присоединяйтесь к тысячам путешественников, которые уже открыли для
						себя мир промышленного туризма.
					</p>
					<Link
						to="/catalog"
						className="inline-block bg-white text-primary-blue font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
					>
						Начать путешествие
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-4 gap-8">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-8 h-8 rounded bg-primary-orange flex items-center justify-center">
									<span className="text-lg">🏭</span>
								</div>
								<span className="font-bold">ПромОриентир</span>
							</div>
							<p className="text-gray-400 text-sm">
								Платформа промышленного туризма России. Проект акселератора
								ПромТурИмпульс 2.0
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Навигация</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<Link to="/catalog" className="hover:text-white">
										Каталог
									</Link>
								</li>
								<li>
									<Link to="/assistant" className="hover:text-white">
										AI-Ассистент
									</Link>
								</li>
								<li>
									<Link to="/compare" className="hover:text-white">
										Сравнение
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Информация</h4>
							<ul className="space-y-2 text-gray-400">
								<li>
									<a href="#" className="hover:text-white">
										О проекте
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white">
										Для предприятий
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white">
										Контакты
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Партнёры</h4>
							<p className="text-gray-400 text-sm">
								КССК — Кировский Сельский Строительный Комбинат
							</p>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
						© 2026 ПромОриентир. Вятский государственный университет
					</div>
				</div>
			</footer>
		</div>
	);
}
