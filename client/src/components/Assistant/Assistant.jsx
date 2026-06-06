import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { assistant } from "../../api";

export default function Assistant() {
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Привет! Я AI-ассистент ПромОриентира. Расскажите, кем вы являетесь? (Семья / Студент / Профессионал / Группа школьников)",
		},
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [suggestedTours, setSuggestedTours] = useState([]);
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!input.trim() || loading) return;

		const userMessage = { role: "user", content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setLoading(true);
		setSuggestedTours([]);

		try {
			const history = messages.map((m) => ({
				role: m.role,
				content: m.content,
			}));
			const data = await assistant.chat(input, history);

			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: data.message },
			]);

			if (data.suggested_tour_ids?.length > 0) {
				setSuggestedTours(data.suggested_tour_ids);
			}
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						err.message?.includes("настроен") ||
						err.message?.includes("доступен")
							? "Ассистент временно недоступен. Воспользуйтесь фильтрами каталога."
							: "Произошла ошибка. Попробуйте ещё раз.",
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const quickQuestions = [
		"Семья с детьми 10 лет",
		"Школьная группа",
		"Студенты, интерес к IT",
		"Профессионалы, производство",
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-gradient-to-br from-primary-orange to-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-4xl">🤖</span>
					</div>
					<h1 className="text-3xl font-bold mb-2">
						AI-Ассистент «Smart Compass»
					</h1>
					<p className="text-gray-600">
						Расскажите о своих интересах, и я подберу идеальные экскурсии
					</p>
				</div>

				{/* Chat */}
				<div className="card overflow-hidden">
					{/* Messages */}
					<div className="h-[400px] overflow-y-auto p-6 space-y-4">
						{messages.map((message, i) => (
							<div
								key={i}
								className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-3 ${
										message.role === "user"
											? "bg-primary-blue text-white rounded-br-sm"
											: "bg-gray-100 rounded-bl-sm"
									}`}
								>
									{message.content}
								</div>
							</div>
						))}
						{loading && (
							<div className="flex justify-start">
								<div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
									<div className="flex gap-1">
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: "0ms" }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: "150ms" }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: "300ms" }}
										></div>
									</div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Suggested Tours */}
					{suggestedTours.length > 0 && (
						<div className="px-6 py-4 bg-orange-50 border-t">
							<h3 className="font-semibold mb-3">Рекомендованные экскурсии:</h3>
							<div className="flex flex-wrap gap-2">
								{suggestedTours.map((id) => (
									<Link
										key={id}
										to={`/tour/${id}`}
										className="badge badge-orange hover:bg-orange-100 transition-colors"
									>
										Экскурсия #{id}
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Quick Questions */}
					{messages.length === 1 && (
						<div className="px-6 py-4 bg-gray-50 border-t">
							<p className="text-sm text-gray-500 mb-3">Быстрый выбор:</p>
							<div className="flex flex-wrap gap-2">
								{quickQuestions.map((q, i) => (
									<button
										key={i}
										onClick={() => setInput(q)}
										className="badge bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
									>
										{q}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Input */}
					<form onSubmit={handleSubmit} className="p-4 border-t flex gap-3">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Опишите, что хотите увидеть..."
							className="input flex-grow"
							disabled={loading}
						/>
						<button
							type="submit"
							disabled={loading || !input.trim()}
							className="btn-primary px-6 disabled:opacity-50"
						>
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
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								/>
							</svg>
						</button>
					</form>
				</div>

				{/* Help */}
				<div className="mt-8 card p-6">
					<h2 className="text-lg font-semibold mb-4">
						Как пользоваться ассистентом
					</h2>
					<ul className="space-y-2 text-gray-600">
						<li>1️⃣ Расскажите о себе (семья, студент, профессионал, группа)</li>
						<li>
							2️⃣ Укажите, что хотите увидеть (роботы, огонь, дегустация и т.д.)
						</li>
						<li>3️⃣ Ответьте на уточняющие вопросы</li>
						<li>4️⃣ Получите персональные рекомендации</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
