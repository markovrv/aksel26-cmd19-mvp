import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { analytics, admin, settings } from "../../api";

export default function AdminDashboard() {
	const [activeTab, setActiveTab] = useState("overview");
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [bookings, setBookings] = useState([]);
	const [settingsData, setSettingsData] = useState({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadData();
	}, [activeTab]);

	const loadData = async () => {
		setLoading(true);
		try {
			if (activeTab === "overview") {
				const analyticsData = await analytics.global();
				setData(analyticsData);
			} else if (activeTab === "users") {
				const usersData = await admin.users();
				setUsers(usersData.users || []);
			} else if (activeTab === "bookings") {
				const bookingsData = await admin.bookings();
				setBookings(bookingsData.bookings || []);
			} else if (activeTab === "settings") {
				const settingsRes = await settings.get();
				const settingsMap = {};
				(settingsRes.settings || []).forEach(
					(s) => (settingsMap[s.key] = s.value),
				);
				setSettingsData(settingsMap);
			}
		} catch (err) {
			console.error("Error loading admin data:", err);
		} finally {
			setLoading(false);
		}
	};

	const updateUser = async (id, role, is_active) => {
		try {
			await admin.updateUser(id, { role, is_active });
			loadData();
		} catch (err) {
			alert("Ошибка обновления");
		}
	};

	const saveSettings = async () => {
		setSaving(true);
		try {
			await settings.update(settingsData);
			alert("Настройки сохранены");
		} catch (err) {
			alert("Ошибка сохранения");
		} finally {
			setSaving(false);
		}
	};

	const tabs = [
		{ id: "overview", label: "Обзор", icon: "📊" },
		{ id: "users", label: "Пользователи", icon: "👥" },
		{ id: "bookings", label: "Заявки", icon: "📋" },
		{ id: "settings", label: "Настройки", icon: "⚙️" },
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Панель администратора</h1>

			{/* Tabs */}
			<div className="flex gap-2 mb-8 overflow-x-auto pb-2">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
							activeTab === tab.id
								? "bg-primary-blue text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						<span className="mr-2">{tab.icon}</span>
						{tab.label}
					</button>
				))}
			</div>

			{/* Content */}
			{loading ? (
				<div className="animate-pulse">
					<div className="h-64 bg-gray-200 rounded-xl"></div>
				</div>
			) : (
				<>
					{/* Overview */}
					{activeTab === "overview" && data && (
						<div className="space-y-6">
							{/* Stats Cards */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="card p-6">
									<div className="text-3xl font-bold text-primary-orange mb-1">
										{data.overview.enterprises}
									</div>
									<div className="text-gray-500">Предприятий</div>
								</div>
								<div className="card p-6">
									<div className="text-3xl font-bold text-primary-blue mb-1">
										{data.overview.tours}
									</div>
									<div className="text-gray-500">Экскурсий</div>
								</div>
								<div className="card p-6">
									<div className="text-3xl font-bold text-green-600 mb-1">
										{data.overview.bookings}
									</div>
									<div className="text-gray-500">Заявок</div>
								</div>
								<div className="card p-6">
									<div className="text-3xl font-bold text-purple-600 mb-1">
										{data.overview.users}
									</div>
									<div className="text-gray-500">Пользователей</div>
								</div>
							</div>

							{/* Top Tours */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">
									Топ экскурсий по просмотрам
								</h2>
								<div className="space-y-3">
									{data.top_tours_by_views?.slice(0, 5).map((tour, i) => (
										<div
											key={tour.id}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center gap-3">
												<span className="w-8 h-8 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">
													{i + 1}
												</span>
												<div>
													<div className="font-medium">{tour.title}</div>
													<div className="text-sm text-gray-500">
														{tour.enterprise_name}
													</div>
												</div>
											</div>
											<div className="text-xl font-bold">
												{tour.views_count}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Bookings by Status */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">
									Заявки по статусам
								</h2>
								<div className="grid grid-cols-5 gap-4">
									{data.bookings_by_status?.map((s) => (
										<div
											key={s.status}
											className="text-center p-4 bg-gray-50 rounded-lg"
										>
											<div className="text-2xl font-bold">{s.count}</div>
											<div className="text-sm text-gray-500 capitalize">
												{s.status}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Users */}
					{activeTab === "users" && (
						<div className="card overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="text-left p-4">Email</th>
										<th className="text-left p-4">Имя</th>
										<th className="text-left p-4">Роль</th>
										<th className="text-left p-4">Статус</th>
										<th className="text-left p-4">Действия</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user) => (
										<tr key={user.id} className="border-t">
											<td className="p-4">{user.email}</td>
											<td className="p-4">{user.name || "—"}</td>
											<td className="p-4">
												<span
													className={`badge ${
														user.role === "admin"
															? "badge-orange"
															: user.role === "enterprise"
																? "badge-blue"
																: "bg-gray-100"
													}`}
												>
													{user.role}
												</span>
											</td>
											<td className="p-4">
												<span
													className={`badge ${user.is_active ? "badge-green" : "bg-red-100 text-red-600"}`}
												>
													{user.is_active ? "Активен" : "Заблокирован"}
												</span>
											</td>
											<td className="p-4">
												<button
													onClick={() =>
														updateUser(user.id, user.role, !user.is_active)
													}
													className="text-sm text-red-600 hover:underline"
												>
													{user.is_active ? "Заблокировать" : "Разблокировать"}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* Bookings */}
					{activeTab === "bookings" && (
						<div className="card overflow-hidden">
							<div className="p-4 border-b flex justify-between items-center">
								<h2 className="font-semibold">Все заявки</h2>
								<a
									href="/api/admin/bookings/export"
									className="btn-secondary text-sm"
								>
									Экспорт CSV
								</a>
							</div>
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="text-left p-4">ID</th>
										<th className="text-left p-4">Заявитель</th>
										<th className="text-left p-4">Экскурсия</th>
										<th className="text-left p-4">Дата</th>
										<th className="text-left p-4">Статус</th>
									</tr>
								</thead>
								<tbody>
									{bookings.map((booking) => (
										<tr key={booking.id} className="border-t">
											<td className="p-4">#{booking.id}</td>
											<td className="p-4">
												<div>{booking.full_name}</div>
												<div className="text-sm text-gray-500">
													{booking.email}
												</div>
											</td>
											<td className="p-4">{booking.tour_title}</td>
											<td className="p-4">
												{booking.desired_date || "Не указана"}
											</td>
											<td className="p-4">
												<span
													className={`badge ${
														booking.status === "confirmed"
															? "badge-green"
															: booking.status === "rejected"
																? "bg-red-100 text-red-600"
																: booking.status === "cancelled"
																	? "bg-gray-100"
																	: "badge-blue"
													}`}
												>
													{booking.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* Settings */}
					{activeTab === "settings" && (
						<div className="space-y-6">
							{/* LLM Settings */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">
									AI-ассистент (LLM)
								</h2>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											API Endpoint
										</label>
										<input
											className="input"
											value={settingsData.llm_base_url || ""}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													llm_base_url: e.target.value,
												})
											}
											placeholder="https://api.openai.com/v1"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											API Key
										</label>
										<input
											type="password"
											className="input"
											value={settingsData.llm_api_key || ""}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													llm_api_key: e.target.value,
												})
											}
											placeholder="sk-..."
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Модель
										</label>
										<input
											className="input"
											value={settingsData.llm_model || ""}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													llm_model: e.target.value,
												})
											}
											placeholder="gpt-4o-mini"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Temperature (0-2)
										</label>
										<input
											type="number"
											step="0.1"
											min="0"
											max="2"
											className="input"
											value={settingsData.llm_temperature || "0.7"}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													llm_temperature: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>

							{/* VK Settings */}
							<div className="card p-6">
								<h2 className="text-xl font-semibold mb-4">
									ВКонтакте уведомления
								</h2>
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											VK Token
										</label>
										<input
											type="password"
											className="input"
											value={settingsData.vk_token || ""}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													vk_token: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Peer ID получателя
										</label>
										<input
											className="input"
											value={settingsData.vk_admin_peer_id || ""}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													vk_admin_peer_id: e.target.value,
												})
											}
										/>
									</div>
								</div>
								<div className="mt-4">
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={settingsData.vk_notifications_enabled === "true"}
											onChange={(e) =>
												setSettingsData({
													...settingsData,
													vk_notifications_enabled: e.target.checked
														? "true"
														: "false",
												})
											}
										/>
										<span>Включить уведомления</span>
									</label>
								</div>
							</div>

							<button
								onClick={saveSettings}
								disabled={saving}
								className="btn-primary"
							>
								{saving ? "Сохранение..." : "Сохранить настройки"}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
