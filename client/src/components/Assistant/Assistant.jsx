import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { assistant, tours, enterprises } from "../../api";

// Extract city from address like "г. Киров, ул. ..."
function extractCity(address) {
	if (!address) return null;
	const match = address.match(/^г\.\s*([^,]+)/);
	return match ? match[1].trim() : null;
}

const WIZARD_STEPS = [
	{
		title: "Выберите город",
		icon: "🏙️",
		key: "city",
		isCitySearch: true,
	},
	{
		title: "Кто вы?",
		icon: "👤",
		options: [
			{ value: "family", label: "👨‍👩‍👧‍👦 Семья с детьми", desc: "Ищу что-то интересное для всей семьи" },
			{ value: "student", label: "🎓 Студент", desc: "Хочу узнать о профессиях и производствах" },
			{ value: "professional", label: "👔 Профессионал", desc: "Интересуюсь технологиями и инновациями" },
			{ value: "teacher", label: "📚 Учитель / преподаватель", desc: "Организую экскурсию для группы" },
		],
		key: "who",
	},
	{
		title: "Что хотите увидеть?",
		icon: "🔍",
		options: [
			{ value: "food", label: "🍬 Производство еды и сладостей", desc: "Дегустации, кондитерские, молочные" },
			{ value: "heavy", label: "⚙️ Тяжёлая промышленность", desc: "Станки, металл, машиностроение" },
			{ value: "light", label: "🧵 Лёгкая промышленность", desc: "Текстиль, игрушки, обувь" },
			{ value: "it", label: "💻 IT и инновации", desc: "Технопарки, дата-центры, разработка" },
			{ value: "construction", label: "🏗️ Строительство", desc: "ЖБИ, панели, стройматериалы" },
		],
		key: "what",
	},
	{
		title: "Дополнительные пожелания",
		icon: "✨",
		options: [
			{ value: "food", label: "🍽️ Нужно питание на месте", desc: "Чтобы можно было пообедать" },
			{ value: "hotel", label: "🏨 Нужен отель рядом", desc: "Планирую остаться на ночь" },
			{ value: "souvenirs", label: "🎁 Хочу сувениры", desc: "Привезти подарки с производства" },
			{ value: "degustation", label: "🍬 Хочу дегустацию", desc: "Попробовать продукцию" },
			{ value: "any", label: "🤷 Без разницы", desc: "Просто покажите всё" },
		],
		key: "extra",
	},
];

// Simple markdown-like parser
function parseMarkdown(text) {
	if (!text) return "";
	let html = text
		.replace(/^### (.+)$/gm, '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>')
		.replace(/^## (.+)$/gm, '<h2 class="font-semibold text-lg mt-3 mb-1">$1</h2>')
		.replace(/^# (.+)$/gm, '<h1 class="font-bold text-xl mt-3 mb-1">$1</h1>')
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
		.replace(/(<li.*<\/li>\n?)+/g, '<ul class="mb-2">$&</ul>')
		.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
		.replace(/(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g, '<ol class="mb-2">$&</ol>')
		.replace(/\n/g, '<br/>');
	return html;
}

export default function Assistant() {
	const navigate = useNavigate();
	const [messages, setMessages] = useState(() => {
		try { const saved = sessionStorage.getItem("assistantMessages"); return saved ? JSON.parse(saved) : []; }
		catch { return []; }
	});
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [recommendations, setRecommendations] = useState(() => {
		try { const saved = sessionStorage.getItem("assistantRecommendations"); return saved ? JSON.parse(saved) : []; }
		catch { return []; }
	});
	const [wizardStep, setWizardStep] = useState(0);
	const [wizardAnswers, setWizardAnswers] = useState({});
	const [showWizard, setShowWizard] = useState(() => {
		try { return !sessionStorage.getItem("assistantMessages"); }
		catch { return true; }
	});
	const [tourList, setTourList] = useState([]);
	const [enterpriseList, setEnterpriseList] = useState([]);
	const [citySearch, setCitySearch] = useState("");
	const [cityError, setCityError] = useState("");
	const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
	const chatEndRef = useRef(null);
	const cityInputRef = useRef(null);

	useEffect(() => {
		sessionStorage.setItem("assistantMessages", JSON.stringify(messages));
	}, [messages]);

	useEffect(() => {
		sessionStorage.setItem("assistantRecommendations", JSON.stringify(recommendations));
	}, [recommendations]);

	useEffect(() => {
		Promise.all([
			tours.list({ status: "published" }),
			enterprises.list({ status: "published" }),
		]).then(([tourData, entData]) => {
			setTourList(tourData.tours || []);
			const ents = entData.enterprises || entData || [];
			setEnterpriseList(Array.isArray(ents) ? ents : []);
		}).catch(() => {});
	}, []);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const availableCities = useMemo(() => {
		const cities = new Set();
		for (const e of enterpriseList) {
			const city = extractCity(e.address);
			if (city) cities.add(city);
		}
		return [...cities].sort();
	}, [enterpriseList]);

	const filteredCities = citySearch
		? availableCities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
		: availableCities;

	const startWizard = () => {
		setShowWizard(true);
		setWizardStep(0);
		setWizardAnswers({});
		setMessages([]);
		setRecommendations([]);
		setCitySearch("");
		setCityError("");
		sessionStorage.removeItem("assistantMessages");
		sessionStorage.removeItem("assistantRecommendations");
	};

	const handleCitySelect = (city) => {
		setCitySearch(city);
		setCityDropdownOpen(false);
		setCityError("");
		handleWizardAnswer(city);
	};

	const handleCitySearchNext = () => {
		const found = availableCities.find((c) => c.toLowerCase() === citySearch.trim().toLowerCase());
		if (found) {
			handleCitySelect(found);
		} else {
			setCityError(`Город "${citySearch.trim()}" не найден. Выберите из списка:`);
		}
	};

	const handleWizardAnswer = (value) => {
		const step = WIZARD_STEPS[wizardStep];
		const newAnswers = { ...wizardAnswers, [step.key]: value };
		setWizardAnswers(newAnswers);

		if (wizardStep < WIZARD_STEPS.length - 1) {
			setWizardStep(wizardStep + 1);
		} else {
			setShowWizard(false);
			const whoOpt = step.options?.find((o) => o.value === value);
			const whoLabel = whoOpt?.label || value;
			const allAnswers = { ...newAnswers };

			const cityPart = allAnswers.city ? `в городе ${allAnswers.city}` : "";
			const userMessage = `Я ${whoLabel}${cityPart ? " " + cityPart : ""}. Интересуюсь ${allAnswers.what}. Хочу: ${allAnswers.extra}. Подбери экскурсии.`;

			setMessages([{
				role: "user",
				content: WIZARD_STEPS.map((s) => {
					const val = allAnswers[s.key];
					if (s.isCitySearch) return `🏙️ Город: ${val}`;
					const opt = s.options?.find((o) => o.value === val);
					return `${s.icon} ${opt?.label || val}`;
				}).join("\n"),
			}]);

			setLoading(true);
			assistant.chat([{ role: "user", content: userMessage }])
				.then((data) => {
					if (data.tours?.length > 0) {
						setMessages((prev) => [...prev, { role: "assistant", content: data.response || "Вот что я нашёл для вас!" }]);
						setRecommendations(data.tours);
					} else {
						setMessages((prev) => [...prev, { role: "assistant", content: "По вашему запросу ничего не найдено. Попробуйте изменить запрос — вот похожие варианты:" }]);
						filterLocalTours(allAnswers);
					}
				})
				.catch(() => {
					setMessages((prev) => [...prev, { role: "assistant", content: "Не удалось получить ответ от AI. Вот подборка экскурсий по вашим интересам:" }]);
					filterLocalTours(allAnswers);
				})
				.finally(() => setLoading(false));
		}
	};

	const filterLocalTours = (answers) => {
		let filtered = [...tourList];
		if (answers.city) filtered = filtered.filter((t) => t.region === answers.city || t.address?.includes(answers.city));
		if (answers.what === "food") filtered = filtered.filter((t) => t.production_type === "Пищевое");
		else if (answers.what === "heavy") filtered = filtered.filter((t) => t.production_type === "Машиностроение");
		else if (answers.what === "light") filtered = filtered.filter((t) => t.production_type === "Лёгкая промышленность");
		else if (answers.what === "it") filtered = filtered.filter((t) => t.production_type === "IT-производство");
		else if (answers.what === "construction") filtered = filtered.filter((t) => t.production_type === "Строительное");
		if (answers.extra === "food") filtered = filtered.filter((t) => t.food_on_site);
		if (answers.extra === "souvenirs") filtered = filtered.filter((t) => t.has_souvenirs);
		if (answers.extra === "degustation") filtered = filtered.filter((t) => t.has_degustation);
		setRecommendations(filtered.map((t) => t.id));
	};

	const handleSend = async () => {
		if (!input.trim()) return;
		const userMessage = { role: "user", content: input };
		setMessages([...messages, userMessage]);
		setInput("");
		setLoading(true);
		try {
			const data = await assistant.chat([...messages, userMessage]);
			setMessages([...messages, userMessage, { role: "assistant", content: data.response }]);
			if (data.tours?.length > 0) setRecommendations(data.tours);
		} catch {
			setMessages([...messages, userMessage, { role: "assistant", content: "Извините, произошла ошибка. Попробуйте ещё раз." }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold mb-2">🧭 Smart Compass — AI-помощник</h1>
					<p className="text-gray-600">Пошаговый подбор или свободный диалог</p>
				</div>
				<button onClick={startWizard} className="btn-primary">🔄 Начать заново</button>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				<div className="md:col-span-2">
					{showWizard && (
						<div className="card p-8 mb-6">
							<div className="flex items-center gap-3 mb-6">
								{WIZARD_STEPS.map((step, i) => (
									<React.Fragment key={i}>
										<div className={`flex items-center gap-2 ${i <= wizardStep ? "text-primary-orange" : "text-gray-400"}`}>
											<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= wizardStep ? "bg-primary-orange text-white" : "bg-gray-200"}`}>
												{i < wizardStep ? "✓" : i + 1}
											</div>
											<span className="hidden sm:inline text-sm font-medium">{step.icon}</span>
										</div>
										{i < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < wizardStep ? "bg-primary-orange" : "bg-gray-200"}`}></div>}
									</React.Fragment>
								))}
							</div>

							<div className="animate-fadeIn">
								<h2 className="text-2xl font-bold mb-2">{WIZARD_STEPS[wizardStep].icon} {WIZARD_STEPS[wizardStep].title}</h2>

								{/* City search step */}
								{WIZARD_STEPS[wizardStep].isCitySearch ? (
									<div>
										<p className="text-gray-500 mb-4">Введите название города, чтобы найти экскурсии рядом</p>
										<div className="relative" ref={cityInputRef}>
											<input
												type="text"
												className="input w-full"
												placeholder="Например: Киров"
												value={citySearch}
												onChange={(e) => { setCitySearch(e.target.value); setCityDropdownOpen(true); setCityError(""); }}
												onFocus={() => setCityDropdownOpen(true)}
												onKeyDown={(e) => { if (e.key === "Enter") handleCitySearchNext(); }}
												autoFocus
											/>
											{cityDropdownOpen && filteredCities.length > 0 && (
												<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
													{filteredCities.map((city) => (
														<button
															key={city}
															onClick={() => handleCitySelect(city)}
															className="w-full text-left px-4 py-2.5 hover:bg-orange-50 hover:text-primary-orange transition-colors text-sm"
														>
															📍 {city}
														</button>
													))}
												</div>
											)}
										</div>
										{cityError && (
											<div className="mt-3">
												<p className="text-red-500 text-sm mb-2">{cityError}</p>
												<div className="flex flex-wrap gap-2">
													{availableCities.map((city) => (
														<button
															key={city}
															onClick={() => handleCitySelect(city)}
															className="px-3 py-1.5 bg-gray-100 hover:bg-primary-orange hover:text-white rounded-lg text-sm transition-colors"
														>
															📍 {city}
														</button>
													))}
												</div>
											</div>
										)}
										{citySearch && !cityError && (
											<button onClick={handleCitySearchNext} className="btn-primary mt-4">Далее →</button>
										)}
									</div>
								) : (
									<div>
										<p className="text-gray-500 mb-6">Выберите один из вариантов</p>
										<div className="space-y-3">
											{WIZARD_STEPS[wizardStep].options.map((opt) => (
												<button
													key={opt.value}
													onClick={() => handleWizardAnswer(opt.value)}
													className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-primary-orange hover:bg-orange-50 transition-all group"
												>
													<div className="flex items-start gap-3">
														<div className="text-2xl">{opt.label.split(" ")[0]}</div>
														<div>
															<div className="font-semibold group-hover:text-primary-orange transition-colors">{opt.label}</div>
															<div className="text-sm text-gray-500">{opt.desc}</div>
														</div>
													</div>
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{!showWizard && (
						<div className="card p-6">
							<div className="h-96 overflow-y-auto mb-4 space-y-4">
								{messages.length === 0 && (
									<div className="text-center text-gray-500 py-12">
										<div className="text-6xl mb-4">🧭</div>
										<p className="text-lg mb-4">Привет! Я помогу подобрать идеальную экскурсию.</p>
										<p className="text-sm">Расскажите, что вас интересует, или начните пошаговый подбор</p>
										<button onClick={startWizard} className="btn-primary mt-6">🚀 Начать пошаговый подбор</button>
									</div>
								)}
								{messages.map((m, i) => (
									<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
										<div className={`max-w-2xl p-4 rounded-lg whitespace-pre-line ${m.role === "user" ? "bg-primary-orange text-white" : "bg-gray-100 text-gray-800"}`}>
											{m.role === "user" ? m.content : <div dangerouslySetInnerHTML={{ __html: parseMarkdown(m.content) }} />}
											{m.role === "assistant" && recommendations.length > 0 && (
												<div className="mt-3 flex flex-wrap gap-2">
													{recommendations.map((id) => {
														const tour = tourList.find((t) => t.id === id);
														if (!tour) return null;
														return (
															<a key={id} href={`/tour/${id}`} onClick={(e) => { e.preventDefault(); navigate(`/tour/${id}`); }}
																className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-primary-orange text-primary-orange rounded-lg text-xs font-medium hover:bg-primary-orange hover:text-white transition-colors"
															>🔗 {tour.title}</a>
														);
													})}
												</div>
											)}
										</div>
									</div>
								))}
								{loading && (
									<div className="flex justify-start">
										<div className="bg-gray-100 p-4 rounded-lg">
											<div className="flex gap-1">
												<div className="w-2 h-2 bg-primary-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
												<div className="w-2 h-2 bg-primary-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
												<div className="w-2 h-2 bg-primary-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
											</div>
										</div>
									</div>
								)}
								<div ref={chatEndRef} />
							</div>

							<div className="flex gap-2">
								<input type="text" className="input flex-grow" placeholder="Опишите, что хотите увидеть..." value={input}
									onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
								<button onClick={handleSend} className="btn-primary" disabled={loading}>Отправить</button>
							</div>
						</div>
					)}
				</div>

				<div className="space-y-4">
					{!showWizard && (
						<>
							<div className="card p-6">
								<h3 className="font-semibold mb-4">⚡ Быстрые вопросы</h3>
								<div className="space-y-2">
									{["Покажи экскурсии с дегустацией", "Что-нибудь для школьников", "Бесплатные экскурсии", "Экскурсии IT-производства"].map((q, i) => (
										<button key={i} onClick={() => setInput(q)} className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm">{q}</button>
									))}
								</div>
							</div>
							<div className="card p-6">
								<h3 className="font-semibold mb-4">🚀 Пошаговый подбор</h3>
								<p className="text-sm text-gray-600 mb-4">Ответьте на 4 вопроса, и мы подберём идеальные экскурсии</p>
								<button onClick={startWizard} className="btn-primary w-full text-center">Начать подбор</button>
							</div>
						</>
					)}

					{recommendations.length > 0 && (
						<div className="card p-6">
							<h3 className="font-semibold mb-4">🎯 Рекомендации</h3>
							<div className="space-y-2">
								{recommendations.slice(0, 6).map((id) => {
									const tour = tourList.find((t) => t.id === id);
									if (!tour) return null;
									return (
										<button key={id} onClick={() => navigate(`/tour/${id}`)} className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="font-medium text-sm line-clamp-1">{tour.title}</div>
											<div className="text-xs text-gray-500">{tour.enterprise_name}</div>
											<div className="text-xs text-primary-orange mt-1">{tour.cost === 0 ? "Бесплатно" : `${tour.cost} ₽`} • {tour.duration === "1h" ? "1ч" : tour.duration === "2h" ? "2ч" : tour.duration === "half_day" ? "½ дня" : "день"}</div>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}