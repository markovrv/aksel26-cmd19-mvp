import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { enterpriseLK, admin, settings as settingsApi, regions as regionsApi, places as placesApi } from "../../api";
import { getRegionCentroid } from "../../utils/regionsToGeoJSON";
import MiniMap from "./MiniMap";

const STATUS_OPTIONS = [
	{ value: "draft", label: "Черновик", class: "bg-gray-100 text-gray-600" },
	{ value: "pending", label: "На модерации", class: "bg-yellow-100 text-yellow-700" },
	{ value: "published", label: "Опубликовано", class: "bg-green-100 text-green-700" },
	{ value: "blocked", label: "Заблокировано", class: "bg-red-100 text-red-700" },
];

const BOOKING_STATUSES = [
	{ value: "new", label: "Новая" },
	{ value: "reviewing", label: "На рассмотрении" },
	{ value: "confirmed", label: "Подтверждена" },
	{ value: "rejected", label: "Отклонена" },
	{ value: "cancelled", label: "Отменена" },
];

const ROLES = [
	{ value: "tourist", label: "Турист" },
	{ value: "enterprise", label: "Предприятие" },
	{ value: "admin", label: "Администратор" },
];

const PRODUCTION_TYPES = [
	"Строительное", "Пищевое", "Машиностроение", "Лёгкая промышленность",
	"IT-производство", "Энергетика", "Химическое", "Деревообработка", "Металлургия",
];

const ALL_TAGS = [
	"бетон", "строительство", "ЖБИ", "производство панелей", "промышленный туризм",
	"пряники", "дегустация", "пищевое производство", "сладости", "конфеты",
	"игрушки", "лёгкая промышленность", "для детей", "текстиль",
	"молочное", "ферма", "сельское хозяйство", "экология",
	"машиностроение", "металлообработка", "промышленное оборудование",
	"металл", "станки", "производство",
	"IT", "технологии", "программирование", "инновации", "роботы",
	"обувь", "кожа",
	"нефть", "энергетика",
	"автомобили", "Татарстан", "конвейер", "инженерия",
	"Урал", "тяжёлое машиностроение", "экскаваторы",
	"шоколад", "атом", "Ростов", "реакторы",
	"пиво", "напитки", "Санкт-Петербург",
	"качество", "лаборатория",
	"история", "музей",
].sort();

const REGION_LIST = [
	"Алтайский край","Амурская область","Архангельская область","Астраханская область",
	"Белгородская область","Брянская область","Владимирская область","Волгоградская область",
	"Вологодская область","Воронежская область","Еврейская автономная область","Забайкальский край",
	"Ивановская область","Иркутская область","Кабардино-Балкарская Республика","Калининградская область",
	"Калужская область","Камчатский край","Карачаево-Черкесская Республика","Кемеровская область",
	"Кировская область","Костромская область","Краснодарский край","Красноярский край",
	"Курганская область","Курская область","Ленинградская область","Липецкая область",
	"Магаданская область","Московская область","Мурманская область","Ненецкий автономный округ",
	"Нижегородская область","Новгородская область","Новосибирская область","Омская область",
	"Оренбургская область","Орловская область","Пензенская область","Пермский край",
	"Приморский край","Псковская область","Республика Адыгея","Республика Алтай",
	"Республика Башкортостан","Республика Бурятия","Республика Дагестан","Республика Ингушетия",
	"Республика Калмыкия","Республика Карелия","Республика Коми","Республика Марий Эл",
	"Республика Мордовия","Республика Саха (Якутия)","Республика Северная Осетия-Алания",
	"Республика Татарстан","Республика Тыва","Республика Хакасия","Ростовская область",
	"Рязанская область","Самарская область","Саратовская область","Сахалинская область",
	"Свердловская область","Смоленская область","Ставропольский край","Тамбовская область",
	"Тверская область","Томская область","Тульская область","Тюменская область",
	"Удмуртская Республика","Ульяновская область","Хабаровский край","Ханты-Мансийский автономный округ",
	"Челябинская область","Чеченская Республика","Чувашская Республика","Чукотский автономный округ",
	"Ямало-Ненецкий автономный округ","Ярославская область",
];

const DURATION_OPTIONS = [
	{ value: "1h", label: "1 час" },
	{ value: "2h", label: "2 часа" },
	{ value: "half_day", label: "Полдня" },
	{ value: "full_day", label: "Полный день" },
];

const AGE_OPTIONS = [
	{ value: "6plus", label: "6+" },
	{ value: "12plus", label: "12+" },
	{ value: "18plus", label: "18+" },
];

const TABS = [
	{ key: "overview", icon: "📊", label: "Обзор" },
	{ key: "enterprises", icon: "🏭", label: "Предприятия" },
	{ key: "tours", icon: "🎫", label: "Экскурсии" },
	{ key: "bookings", icon: "📋", label: "Заявки" },
	{ key: "users", icon: "👥", label: "Пользователи" },
	{ key: "places", icon: "📍", label: "Места" },
	{ key: "regions", icon: "🗺️", label: "Регионы" },
	{ key: "settings", icon: "⚙️", label: "Настройки" },
];

export default function AdminDashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");

	// Data states
	const [enterprises, setEnterprises] = useState([]);
	const [bookings, setBookings] = useState([]);
	const [users, setUsers] = useState([]);
	const [settings, setSettings] = useState({});
	const [regions, setRegions] = useState([]);
	const [overview, setOverview] = useState(null);
	const [placeList, setPlaceList] = useState([]);
	const [tourList, setTourList] = useState([]);

	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState({ type: "", text: "" });

	// Filters
	const [filterStatus, setFilterStatus] = useState("");
	const [editRegion, setEditRegion] = useState(null);
	const [editPlace, setEditPlace] = useState(null);
	const [placeFilter, setPlaceFilter] = useState({ region: "", type: "" });
	const [showCreateEnterprise, setShowCreateEnterprise] = useState(false);
	const [newEnterprise, setNewEnterprise] = useState({ name: "", region: "", address: "", production_type: "", description: "", owner_email: "", owner_password: "enterprise123" });
	const [editEnterprise, setEditEnterprise] = useState(null);

	// Tour CRUD
	const [showCreateTour, setShowCreateTour] = useState(false);
	const [editTour, setEditTour] = useState(null);
	const [newTour, setNewTour] = useState({
		enterprise_id: "", title: "", description: "", duration: "2h",
		cost: 0, max_group_size: 20, min_age: "6plus",
		production_type: "", status: "draft",
		tags: "[]", contact_email: "",
	});

	useEffect(() => {
		if (user?.role !== "admin") return;
		loadData();
	}, [user, activeTab, filterStatus, placeFilter]);

	const loadData = async () => {
		setLoading(true);
		try {
			switch (activeTab) {
				case "overview": {
					const [entData, bookingData, userData] = await Promise.all([
						enterpriseLK.adminAll().catch(() => ({ enterprises: [] })),
						admin.bookings().catch(() => ({ bookings: [] })),
						admin.users().catch(() => ({ users: [] })),
					]);
					setEnterprises(entData.enterprises || []);
					setBookings(bookingData.bookings || []);
					setUsers(userData.users || []);
					setOverview({
						enterprises: entData.enterprises?.length || 0,
						bookings: bookingData.bookings?.length || 0,
						users: userData.users?.length || 0,
						published: entData.enterprises?.filter((e) => e.status === "published").length || 0,
						pending: entData.enterprises?.filter((e) => e.status === "pending").length || 0,
					});
					break;
				}
				case "enterprises":
					setEnterprises((await enterpriseLK.adminAll({ status: filterStatus || undefined })).enterprises || []);
					break;
				case "tours":
					setTourList((await admin.tours()).tours || []);
					break;
				case "bookings":
					setBookings((await admin.bookings()).bookings || []);
					break;
				case "users":
					setUsers((await admin.users()).users || []);
					break;
				case "places":
					setPlaceList((await placesApi.list({ region: placeFilter.region || undefined, type: placeFilter.type || undefined })).places || []);
					break;
				case "regions":
					setRegions((await regionsApi.list()).regions || []);
					break;
				case "settings":
					setSettings((await settingsApi.get()).settings || {});
					break;
			}
		} catch (err) {
			console.error("Admin load error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (id, newStatus) => {
		try {
			await enterpriseLK.updateStatus(id, newStatus);
			setEnterprises(enterprises.map((e) => e.id === id ? { ...e, status: newStatus } : e));
			setMessage({ type: "success", text: "Статус обновлён" });
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		}
	};

	const handleBookingStatusChange = async (id, newStatus) => {
		try {
			await admin.updateBooking(id, { status: newStatus });
			setBookings(bookings.map((b) => b.id === id ? { ...b, status: newStatus } : b));
			setMessage({ type: "success", text: "Статус заявки обновлён" });
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		}
	};

	const handleUserUpdate = async (id, data) => {
		try {
			await admin.updateUser(id, data);
			setUsers(users.map((u) => u.id === id ? { ...u, ...data } : u));
			setMessage({ type: "success", text: "Пользователь обновлён" });
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		}
	};

	const saveRegion = async () => {
		if (!editRegion.name) { setMessage({ type: "error", text: "Название региона обязательно" }); return; }
		try {
			const payload = { title: editRegion.title, description: editRegion.description, video_url: editRegion.video_url, coords: editRegion.coords || "" };
			if (editRegion.originalName) await regionsApi.update(editRegion.originalName, payload);
			else await regionsApi.create(editRegion);
			setMessage({ type: "success", text: editRegion.originalName ? "Регион обновлён" : "Регион создан" });
			setEditRegion(null);
			loadData();
		} catch (err) { setMessage({ type: "error", text: err.message }); }
	};

	const deleteRegion = async (name) => {
		try { await regionsApi.delete(name); setMessage({ type: "success", text: "Регион удалён" }); loadData(); }
		catch (err) { setMessage({ type: "error", text: err.message }); }
	};

	const computeCentroid = async (regionName) => {
		if (!regionName) { setMessage({ type: "error", text: "Сначала укажите название региона" }); return; }
		try {
			const resp = await fetch("/regions.json");
			const regionsData = await resp.json();
			const polygons = regionsData[regionName];
			if (!polygons) { setMessage({ type: "error", text: `Регион "${regionName}" не найден в regions.json` }); return; }
			const centroid = getRegionCentroid(polygons);
			if (!centroid) { setMessage({ type: "error", text: "Не удалось вычислить центроид" }); return; }
			setEditRegion({ ...editRegion, coords: JSON.stringify(centroid) });
			setMessage({ type: "success", text: `Центроид: [${centroid[0].toFixed(4)}, ${centroid[1].toFixed(4)}]` });
		} catch (err) { setMessage({ type: "error", text: "Ошибка загрузки regions.json" }); }
	};

	const [settingsMsg, setSettingsMsg] = useState({ block: "", text: "", type: "" });

	const handleSaveSettings = async (keys, block) => {
		try {
			const payload = {};
			for (const key of keys) payload[key] = settings[key] || "";
			await settingsApi.update(payload);
			setSettingsMsg({ block, text: "✓ Сохранено", type: "success" });
			setTimeout(() => setSettingsMsg({ block: "", text: "", type: "" }), 3000);
		} catch (err) { setSettingsMsg({ block, text: `✗ ${err.message}`, type: "error" }); }
	};

	const handleTestVk = async () => {
		try { await settingsApi.testVk(); setSettingsMsg({ block: "vk", text: "✅ Тестовое сообщение отправлено!", type: "success" }); setTimeout(() => setSettingsMsg({ block: "", text: "", type: "" }), 3000); }
		catch (err) { setSettingsMsg({ block: "vk", text: `❌ ${err.message}`, type: "error" }); }
	};

	const handleTestAi = async () => {
		try { const result = await settingsApi.testAi(); setSettingsMsg({ block: "ai", text: result.message || "✅ Подключение работает", type: "success" }); setTimeout(() => setSettingsMsg({ block: "", text: "", type: "" }), 3000); }
		catch (err) { setSettingsMsg({ block: "ai", text: `❌ ${err.message}`, type: "error" }); }
	};

	if (!user || user.role !== "admin") {
		return (
			<div className="container mx-auto px-4 py-12 text-center">
				<div className="text-6xl mb-4">🚫</div>
				<h2 className="text-xl font-semibold mb-2">Доступ запрещён</h2>
				<p className="text-gray-500">Только для администраторов</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
			<p className="text-gray-500 mb-8">{user.email}</p>

			{message.text && (
				<div className={`mb-6 px-4 py-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
					{message.text}
					<button onClick={() => setMessage({ type: "", text: "" })} className="float-right font-bold">&times;</button>
				</div>
			)}

			<div className="flex gap-8">
				{/* Sidebar */}
				<div className="w-48 shrink-0 space-y-1">
					{TABS.map((tab) => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
								activeTab === tab.key
									? "bg-primary-orange text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							<span>{tab.icon}</span>
							<span>{tab.label}</span>
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-orange mx-auto"></div>
						</div>
					) : activeTab === "overview" && overview ? (
						/* 📊 Overview */
						<div className="space-y-6">
							<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
								{[
									{ label: "Всего предприятий", value: overview.enterprises, color: "text-primary-orange" },
									{ label: "Опубликовано", value: overview.published, color: "text-green-600" },
									{ label: "На модерации", value: overview.pending, color: "text-yellow-600" },
									{ label: "Заявок", value: overview.bookings, color: "text-industrial-blue" },
									{ label: "Пользователей", value: overview.users, color: "text-purple-600" },
								].map((item, i) => (
									<div key={i} className="card p-6 text-center">
										<div className={`text-3xl font-bold ${item.color} mb-1`}>{item.value}</div>
										<div className="text-sm text-gray-500">{item.label}</div>
									</div>
								))}
							</div>
							<div className="card p-6">
								<h2 className="text-lg font-semibold mb-4">Предприятия на модерации</h2>
								{enterprises.filter((e) => e.status === "pending").length === 0 ? (
									<p className="text-gray-500 text-sm">Нет предприятий на модерации</p>
								) : (
									<div className="space-y-2">
										{enterprises.filter((e) => e.status === "pending").slice(0, 5).map((e) => (
											<div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
												<div>
													<p className="font-medium text-sm">{e.name}</p>
													<p className="text-xs text-gray-500">{e.production_type} • {e.region}</p>
												</div>
												<div className="flex gap-2">
													<button onClick={() => handleStatusChange(e.id, "published")} className="bg-green-500 text-white px-3 py-1 rounded text-xs">Опубликовать</button>
													<button onClick={() => handleStatusChange(e.id, "blocked")} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Отклонить</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					) : activeTab === "enterprises" ? (
						<EnterpriseTab
							filterStatus={filterStatus} setFilterStatus={setFilterStatus}
							enterprises={enterprises} loadData={loadData}
							handleStatusChange={handleStatusChange}
							showCreateEnterprise={showCreateEnterprise} setShowCreateEnterprise={setShowCreateEnterprise}
							newEnterprise={newEnterprise} setNewEnterprise={setNewEnterprise}
							editEnterprise={editEnterprise} setEditEnterprise={setEditEnterprise}
							setMessage={setMessage}
							REGION_LIST={REGION_LIST}
							PRODUCTION_TYPES={PRODUCTION_TYPES}
							ALL_TAGS={ALL_TAGS}
							STATUS_OPTIONS={STATUS_OPTIONS}
							MiniMap={MiniMap}
						/>
					) : activeTab === "tours" ? (
						<TourTab
							tourList={tourList} loadData={loadData}
							showCreateTour={showCreateTour} setShowCreateTour={setShowCreateTour}
							newTour={newTour} setNewTour={setNewTour}
							editTour={editTour} setEditTour={setEditTour}
							enterprises={enterprises}
							setMessage={setMessage}
							DURATION_OPTIONS={DURATION_OPTIONS}
							AGE_OPTIONS={AGE_OPTIONS}
							STATUS_OPTIONS={STATUS_OPTIONS}
							PRODUCTION_TYPES={PRODUCTION_TYPES}
						/>
					) : activeTab === "bookings" ? (
						<div className="space-y-3">
							{bookings.length === 0 ? (
								<div className="card p-12 text-center"><p className="text-gray-500">Нет заявок</p></div>
							) : bookings.map((b) => (
								<div key={b.id} className="card p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-semibold">{b.full_name}</h3>
												<span className={`text-xs px-2 py-0.5 rounded-full ${
													b.status === "confirmed" ? "bg-green-100 text-green-700" :
													b.status === "new" ? "bg-yellow-100 text-yellow-700" :
													b.status === "rejected" ? "bg-red-100 text-red-700" :
													b.status === "reviewing" ? "bg-blue-100 text-blue-700" : "bg-gray-100"
												}`}>
													{BOOKING_STATUSES.find((s) => s.value === b.status)?.label || b.status}
												</span>
											</div>
											<p className="text-sm text-gray-600">{b.tour_title} • {b.enterprise_name}</p>
											<div className="flex gap-4 text-xs text-gray-500 mt-1">
												<span>📧 {b.email}</span>
												<span>👥 {b.group_size} чел.</span>
												{b.desired_date && <span>📅 {b.desired_date}</span>}
											</div>
										</div>
										<select className="text-sm border rounded px-2 py-1" value={b.status}
											onChange={(ev) => handleBookingStatusChange(b.id, ev.target.value)}>
											{BOOKING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
										</select>
									</div>
								</div>
							))}
						</div>
					) : activeTab === "users" ? (
						<div className="overflow-x-auto">
							<table className="w-full card">
								<thead><tr className="border-b">
									<th className="p-4 text-left">ID</th>
									<th className="p-4 text-left">Email</th>
									<th className="p-4 text-left">Имя</th>
									<th className="p-4 text-left">Роль</th>
									<th className="p-4 text-left">Активен</th>
									<th className="p-4 text-left">Дата</th>
								</tr></thead>
								<tbody>
									{users.length === 0 ? (
										<tr><td colSpan="6" className="p-12 text-center text-gray-500">Нет пользователей</td></tr>
									) : users.map((u) => (
										<tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
											<td className="p-4 text-sm">{u.id}</td>
											<td className="p-4 text-sm">{u.email}</td>
											<td className="p-4 text-sm">{u.name || "—"}</td>
											<td className="p-4">
												<select className="text-sm border rounded px-2 py-1" value={u.role}
													onChange={(ev) => handleUserUpdate(u.id, { role: ev.target.value, is_active: u.is_active })}>
													{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
												</select>
											</td>
											<td className="p-4">
												<button onClick={() => handleUserUpdate(u.id, { role: u.role, is_active: !u.is_active })}
													className={`px-2 py-1 rounded text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
													{u.is_active ? "Да" : "Нет"}
												</button>
											</td>
											<td className="p-4 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : activeTab === "places" ? (
						<PlacesTab
							placeList={placeList} loadData={loadData}
							placeFilter={placeFilter} setPlaceFilter={setPlaceFilter}
							editPlace={editPlace} setEditPlace={setEditPlace}
							setMessage={setMessage}
							REGION_LIST={REGION_LIST}
						/>
					) : activeTab === "regions" ? (
						<RegionsTab
							regions={regions} loadData={loadData}
							editRegion={editRegion} setEditRegion={setEditRegion}
							saveRegion={saveRegion} deleteRegion={deleteRegion}
							computeCentroid={computeCentroid}
							setMessage={setMessage}
						/>
					) : activeTab === "settings" ? (
						<SettingsTab
							settings={settings} setSettings={setSettings}
							handleSaveSettings={handleSaveSettings}
							handleTestVk={handleTestVk}
							handleTestAi={handleTestAi}
							settingsMsg={settingsMsg}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
}

/* ==================== Sub-components ==================== */

function EnterpriseTab({
	filterStatus, setFilterStatus, enterprises, loadData, handleStatusChange,
	showCreateEnterprise, setShowCreateEnterprise, newEnterprise, setNewEnterprise,
	editEnterprise, setEditEnterprise, setMessage,
	REGION_LIST, PRODUCTION_TYPES, ALL_TAGS, STATUS_OPTIONS, MiniMap
}) {
	const [entName, setEntName] = useState("");

	return (
		<div>
			<div className="flex items-center justify-between gap-4 mb-6">
				<div className="flex gap-2">
					{["", "pending", "published", "draft", "blocked"].map((s) => (
						<button key={s} onClick={() => setFilterStatus(s)}
							className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === s ? "bg-primary-orange text-white" : "bg-gray-100 text-gray-700"}`}>
							{s ? STATUS_OPTIONS.find((o) => o.value === s)?.label : "Все"}
						</button>
					))}
				</div>
				<button onClick={() => setShowCreateEnterprise(!showCreateEnterprise)} className="btn-primary text-sm">
					{showCreateEnterprise ? "✕ Отмена" : "+ Создать предприятие"}
				</button>
			</div>

			{showCreateEnterprise && (
				<div className="card p-6 mb-6">
					<h3 className="font-semibold mb-4">Новое предприятие</h3>
					<div className="grid md:grid-cols-2 gap-4 mb-4">
						<div><label className="block text-sm font-medium mb-1">Название *</label>
							<input className="input" value={newEnterprise.name} onChange={(e) => setNewEnterprise({ ...newEnterprise, name: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">Тип производства</label>
							<select className="input" value={newEnterprise.production_type} onChange={(e) => setNewEnterprise({ ...newEnterprise, production_type: e.target.value })}>
								<option value="">— Выберите —</option>
								{PRODUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
							</select></div>
						<div><label className="block text-sm font-medium mb-1">Регион</label>
							<select className="input" value={newEnterprise.region} onChange={(e) => setNewEnterprise({ ...newEnterprise, region: e.target.value })}>
								<option value="">— Выберите —</option>
								{REGION_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
							</select></div>
						<div><label className="block text-sm font-medium mb-1">Адрес</label>
							<input className="input" value={newEnterprise.address} onChange={(e) => setNewEnterprise({ ...newEnterprise, address: e.target.value })} /></div>
						<div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Описание</label>
							<textarea className="input" rows="2" value={newEnterprise.description} onChange={(e) => setNewEnterprise({ ...newEnterprise, description: e.target.value })} /></div>
						<div className="border-t pt-4 md:col-span-2">
							<p className="text-sm font-medium text-gray-700 mb-3">Привязка пользователя с ролью «Предприятие»</p>
							<div className="grid md:grid-cols-2 gap-4">
								<div><label className="block text-sm font-medium mb-1">Email владельца</label>
									<input className="input" placeholder="enterprise@example.ru" value={newEnterprise.owner_email}
										onChange={(e) => setNewEnterprise({ ...newEnterprise, owner_email: e.target.value })} />
									<p className="text-xs text-gray-400 mt-1">Если email уже существует, пользователь будет привязан</p></div>
								<div><label className="block text-sm font-medium mb-1">Пароль</label>
									<input className="input" value={newEnterprise.owner_password}
										onChange={(e) => setNewEnterprise({ ...newEnterprise, owner_password: e.target.value })} /></div>
							</div>
						</div>
					</div>
					<button onClick={async () => {
						if (!newEnterprise.name) { setMessage({ type: "error", text: "Название обязательно" }); return; }
						try {
							await admin.createEnterprise({ ...newEnterprise, owner_email: newEnterprise.owner_email || undefined });
							setMessage({ type: "success", text: "Предприятие создано!" });
							setShowCreateEnterprise(false);
							setNewEnterprise({ name: "", region: "", address: "", production_type: "", description: "", owner_email: "", owner_password: "enterprise123" });
							loadData();
						} catch (err) { setMessage({ type: "error", text: err.message }); }
					}} className="btn-primary text-sm">Создать предприятие</button>
				</div>
			)}

			{editEnterprise && (
				<div className="card p-6 mb-6">
					<h3 className="font-semibold mb-4">Редактировать предприятие</h3>
					<div className="grid md:grid-cols-3 gap-4 mb-4">
						<div><label className="block text-sm font-medium mb-1">Название *</label>
							<input className="input" value={editEnterprise.name} onChange={(e) => setEditEnterprise({ ...editEnterprise, name: e.target.value })} placeholder="Например: Кондитерская фабрика «Дымка»" />
							<p className="text-xs text-gray-400 mt-1">Отображается в каталоге и на карточке предприятия</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Тип производства</label>
							<select className="input" value={editEnterprise.production_type || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, production_type: e.target.value })}>
								<option value="">— Выберите —</option>
								{PRODUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
							</select>
							<p className="text-xs text-gray-400 mt-1">Определяет иконку и цвет метки на карте</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Регион</label>
							<select className="input" value={editEnterprise.region || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, region: e.target.value })}>
								<option value="">— Выберите —</option>
								{REGION_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
							</select>
							<p className="text-xs text-gray-400 mt-1">Субъект РФ, где находится предприятие</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Адрес</label><input className="input" value={editEnterprise.address || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, address: e.target.value })} placeholder="г. Киров, ул. Промышленная, 15" />
						<p className="text-xs text-gray-400 mt-1">Фактический адрес производства</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Сайт</label><input className="input" value={editEnterprise.site_url || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, site_url: e.target.value })} placeholder="https://kssk.ru" />
						<p className="text-xs text-gray-400 mt-1">Официальный сайт предприятия</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">VK группа</label><input className="input" value={editEnterprise.vk_group_url || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, vk_group_url: e.target.value })} placeholder="https://vk.com/kssk_kirov" />
						<p className="text-xs text-gray-400 mt-1">Ссылка на сообщество ВКонтакте</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Фото URL</label><input className="input" value={editEnterprise.vk_photos_url || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, vk_photos_url: e.target.value })} placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg" />
						<p className="text-xs text-gray-400 mt-1">Прямые URL изображений через запятую, или один URL без запятой. Фото отображаются в галерее на странице предприятия</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Видео URL</label><input className="input" value={editEnterprise.vk_video_url || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, vk_video_url: e.target.value })} placeholder="https://vkvideo.ru/video_ext.php?oid=-102969270&id=456239332&hash=..." />
						<p className="text-xs text-gray-400 mt-1">Ссылка на iframe видео (например, из VK Видео). Отображается в блоке «Видео о предприятии»</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Панорама URL</label><input className="input" value={editEnterprise.panorama_url || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, panorama_url: e.target.value })} placeholder="https://panorama.example.com/kssk" />
						<p className="text-xs text-gray-400 mt-1">Ссылка на 360° панораму производства. Отображается на вкладке «Миф и реальность»</p>
						</div>
					</div>
					<div className="grid md:grid-cols-3 gap-4 mb-4">
						<div className="md:col-span-3">
							<label className="block text-sm font-medium mb-1">Координаты на карте</label>
							<div className="flex gap-2 mb-2">
								<input className="input flex-1" value={editEnterprise.coords || ""}
									onChange={(e) => setEditEnterprise({ ...editEnterprise, coords: e.target.value })} placeholder="58.6000, 49.6800" />
							</div>
							<p className="text-xs text-gray-400 mb-2">Формат: широта, долгота (через запятую). Перетащите маркер на карте чтобы установить координаты</p>
							<MiniMap coords={editEnterprise.coords} onCoordsChange={(val) => setEditEnterprise({ ...editEnterprise, coords: val })} />
						</div>
						<div className="md:col-span-3">
							<label className="block text-sm font-medium mb-1">Теги</label>
							<div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded-lg p-2 bg-white">
								{(() => {
									const cur = Array.isArray(editEnterprise.tags) ? editEnterprise.tags
										: typeof editEnterprise.tags === "string" ? (() => { try { return JSON.parse(editEnterprise.tags || "[]"); } catch { return []; } })() : [];
									return ALL_TAGS.map((tag) => {
										const checked = cur.includes(tag);
										return (
											<label key={tag} className={`inline-flex px-2 py-1 rounded text-xs cursor-pointer ${checked ? "bg-primary-orange text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
												<input type="checkbox" className="hidden" checked={checked}
													onChange={() => setEditEnterprise({ ...editEnterprise, tags: checked ? cur.filter((t) => t !== tag) : [...cur, tag] })} />
												{tag}
											</label>
										);
									});
								})()}
							</div>
							<p className="text-xs text-gray-400 mt-1">Выберите теги — они отображаются в карточке предприятия в каталоге и помогают в поиске</p>
						</div>
						<div><label className="block text-sm font-medium mb-1">Статус</label>
							<select className="input" value={editEnterprise.status || "draft"} onChange={(e) => setEditEnterprise({ ...editEnterprise, status: e.target.value })}>
								{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
							</select>
							<p className="text-xs text-gray-400 mt-1">«Опубликовано» — предприятие видно в каталоге. «Черновик» — скрыто</p>
						</div>
					</div>
					<div><label className="block text-sm font-medium mb-1">Описание</label><textarea className="input" rows="3" value={editEnterprise.description || ""} onChange={(e) => setEditEnterprise({ ...editEnterprise, description: e.target.value })} placeholder="Крупнейший производитель железобетонных изделий в Кировской области..." />
					<p className="text-xs text-gray-400 mt-1">Краткое описание предприятия. Отображается на главной странице и в карточке предприятия</p>
					</div>
					<div className="flex gap-2 mt-4">
						<button onClick={async () => {
							if (!editEnterprise.name) { setMessage({ type: "error", text: "Название обязательно" }); return; }
							try {
								const tagsVal = typeof editEnterprise.tags === "string" ? editEnterprise.tags : JSON.stringify(editEnterprise.tags || []);
								await admin.updateEnterprise(editEnterprise.id, { ...editEnterprise, tags: tagsVal });
								setMessage({ type: "success", text: "Предприятие обновлено" });
								setEditEnterprise(null);
								loadData();
							} catch (err) { setMessage({ type: "error", text: err.message }); }
						}} className="btn-primary text-sm">Сохранить</button>
						<button onClick={() => setEditEnterprise(null)} className="btn-outline text-sm">Отмена</button>
					</div>
				</div>
			)}

			<div className="space-y-3">
				{enterprises.length === 0 ? (
					<div className="card p-12 text-center"><p className="text-gray-500">Нет предприятий</p></div>
				) : enterprises.map((e) => (
					<div key={e.id} className="card p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="font-semibold">{e.name}</h3>
									<span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_OPTIONS.find((o) => o.value === e.status)?.class || "bg-gray-100"}`}>
										{STATUS_OPTIONS.find((o) => o.value === e.status)?.label || e.status}
									</span>
								</div>
								<p className="text-sm text-gray-500">{e.production_type} • {e.region}</p>
								{e.user_email && <p className="text-xs text-gray-400">Владелец: {e.user_email}</p>}
							</div>
							<div className="flex gap-2 items-center">
								<select className="text-sm border rounded px-2 py-1" value={e.status} onChange={(ev) => handleStatusChange(e.id, ev.target.value)}>
									{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
								</select>
								<button onClick={() => setEditEnterprise(e)} className="text-sm text-industrial-blue hover:underline">✏️</button>
								<button onClick={async () => {
									if (!window.confirm(`Удалить "${e.name}"?`)) return;
									try { await admin.deleteEnterprise(e.id); setMessage({ type: "success", text: "Предприятие удалено" }); loadData(); }
									catch (err) { setMessage({ type: "error", text: err.message }); }
								}} className="text-sm text-red-500 hover:underline">🗑️</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function TourTab({
	tourList, loadData, showCreateTour, setShowCreateTour,
	newTour, setNewTour, editTour, setEditTour,
	enterprises, setMessage,
	DURATION_OPTIONS, AGE_OPTIONS, STATUS_OPTIONS, PRODUCTION_TYPES
}) {
	useEffect(() => { if (showCreateTour || editTour) loadEnterprises(); }, [showCreateTour, editTour]);
	const loadEnterprises = async () => {
		try { const data = await enterpriseLK.adminAll(); setEntList(data.enterprises || []); } catch (e) { setEntList([]); }
	};
	const [entList, setEntList] = useState([]);

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold">Экскурсии</h2>
				<button onClick={() => setShowCreateTour(!showCreateTour)} className="btn-primary text-sm">
					{showCreateTour ? "✕ Отмена" : "+ Создать экскурсию"}
				</button>
			</div>

			{showCreateTour && (
				<div className="card p-6 mb-6">
					<h3 className="font-semibold mb-4">Новая экскурсия</h3>
					<TourForm
						data={newTour} setData={setNewTour}
						entList={entList} DURATION_OPTIONS={DURATION_OPTIONS}
						AGE_OPTIONS={AGE_OPTIONS} STATUS_OPTIONS={STATUS_OPTIONS}
						PRODUCTION_TYPES={PRODUCTION_TYPES}
					/>
					<div className="flex gap-2 mt-4">
						<button onClick={async () => {
							if (!newTour.title || !newTour.enterprise_id) {
								setMessage({ type: "error", text: "Название и предприятие обязательны" }); return;
							}
							try {
								const tagsVal = typeof newTour.tags === "string" ? newTour.tags : JSON.stringify(newTour.tags || []);
								await admin.createTour({ ...newTour, tags: tagsVal });
								setMessage({ type: "success", text: "Экскурсия создана" });
								setShowCreateTour(false);
								setNewTour({ enterprise_id: "", title: "", description: "", duration: "2h", cost: 0, max_group_size: 20, min_age: "6plus", production_type: "", status: "draft", tags: "[]", contact_email: "" });
								loadData();
							} catch (err) { setMessage({ type: "error", text: err.message }); }
						}} className="btn-primary text-sm">Создать экскурсию</button>
					</div>
				</div>
			)}

			{editTour && (
				<div className="card p-6 mb-6">
					<h3 className="font-semibold mb-4">Редактировать экскурсию</h3>
					<TourForm
						data={editTour} setData={(d) => setEditTour({ ...editTour, ...d })}
						entList={entList} DURATION_OPTIONS={DURATION_OPTIONS}
						AGE_OPTIONS={AGE_OPTIONS} STATUS_OPTIONS={STATUS_OPTIONS}
						PRODUCTION_TYPES={PRODUCTION_TYPES}
					/>
					<div className="flex gap-2 mt-4">
						<button onClick={async () => {
							if (!editTour.title) { setMessage({ type: "error", text: "Название обязательно" }); return; }
							try {
								const tagsVal = typeof editTour.tags === "string" ? editTour.tags : JSON.stringify(editTour.tags || []);
								await admin.updateTour(editTour.id, { ...editTour, tags: tagsVal });
								setMessage({ type: "success", text: "Экскурсия обновлена" });
								setEditTour(null);
								loadData();
							} catch (err) { setMessage({ type: "error", text: err.message }); }
						}} className="btn-primary text-sm">Сохранить</button>
						<button onClick={() => setEditTour(null)} className="btn-outline text-sm">Отмена</button>
					</div>
				</div>
			)}

			<div className="space-y-3">
				{tourList.length === 0 ? (
					<div className="card p-12 text-center"><p className="text-gray-500">Нет экскурсий</p></div>
				) : tourList.map((t) => (
					<div key={t.id} className="card p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<h3 className="font-semibold">{t.title}</h3>
									<span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_OPTIONS.find((o) => o.value === t.status)?.class || "bg-gray-100"}`}>
										{STATUS_OPTIONS.find((o) => o.value === t.status)?.label || t.status}
									</span>
								</div>
								<p className="text-sm text-gray-500">{t.enterprise_name} • {DURATION_OPTIONS.find((d) => d.value === t.duration)?.label || t.duration} • {t.cost} ₽</p>
								{t.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.description}</p>}
							</div>
							<div className="flex gap-2 items-center ml-4 shrink-0">
								<button onClick={() => { setEditTour(t); loadEnterprises(); }} className="text-sm text-industrial-blue hover:underline">✏️</button>
								<button onClick={async () => {
									if (!window.confirm(`Удалить экскурсию "${t.title}"?`)) return;
									try { await admin.deleteTour(t.id); setMessage({ type: "success", text: "Экскурсия удалена" }); loadData(); }
									catch (err) { setMessage({ type: "error", text: err.message }); }
								}} className="text-sm text-red-500 hover:underline">🗑️</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function TourForm({ data, setData, entList, DURATION_OPTIONS, AGE_OPTIONS, STATUS_OPTIONS, PRODUCTION_TYPES }) {
	return (
		<div className="grid md:grid-cols-3 gap-4">
			<div className="md:col-span-3">
				<label className="block text-sm font-medium mb-1">Предприятие *</label>
				<select className="input" value={data.enterprise_id || ""}
					onChange={(e) => setData({ ...data, enterprise_id: Number(e.target.value) })}>
					<option value="">— Выберите предприятие —</option>
					{entList.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
				</select>
			</div>
			<div className="md:col-span-3">
				<label className="block text-sm font-medium mb-1">Название *</label>
				<input className="input" value={data.title || ""} onChange={(e) => setData({ ...data, title: e.target.value })} />
			</div>
			<div className="md:col-span-3">
				<label className="block text-sm font-medium mb-1">Описание</label>
				<textarea className="input" rows="2" value={data.description || ""} onChange={(e) => setData({ ...data, description: e.target.value })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Длительность</label>
				<select className="input" value={data.duration || "2h"} onChange={(e) => setData({ ...data, duration: e.target.value })}>
					{DURATION_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Стоимость (₽)</label>
				<input className="input" type="number" value={data.cost || 0} onChange={(e) => setData({ ...data, cost: Number(e.target.value) })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Макс. группа (чел.)</label>
				<input className="input" type="number" value={data.max_group_size || 20} onChange={(e) => setData({ ...data, max_group_size: Number(e.target.value) })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Мин. возраст</label>
				<select className="input" value={data.min_age || "6plus"} onChange={(e) => setData({ ...data, min_age: e.target.value })}>
					{AGE_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Тип производства</label>
				<select className="input" value={data.production_type || ""} onChange={(e) => setData({ ...data, production_type: e.target.value })}>
					<option value="">— Выберите —</option>
					{PRODUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Уровень интерактива (1-10)</label>
				<input className="input" type="number" min="1" max="10" value={data.interactivity_level || 5} onChange={(e) => setData({ ...data, interactivity_level: Number(e.target.value) })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Физ. нагрузка (1-10)</label>
				<input className="input" type="number" min="1" max="10" value={data.physical_load || 5} onChange={(e) => setData({ ...data, physical_load: Number(e.target.value) })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Образовательная программа</label>
				<select className="input" value={data.edu_program || ""} onChange={(e) => setData({ ...data, edu_program: e.target.value })}>
					<option value="">— Нет —</option>
					<option value="Знакомство с производством">Знакомство с производством</option>
					<option value="Профориентация">Профориентация</option>
					<option value="Углублённые знания">Углублённые знания</option>
				</select>
			</div>
			<div className="md:col-span-3">
				<label className="block text-sm font-medium mb-1">Инструкции по безопасности</label>
				<textarea className="input" rows="1" value={data.safety_instructions || ""} onChange={(e) => setData({ ...data, safety_instructions: e.target.value })} />
			</div>
			<div className="md:col-span-2">
				<label className="block text-sm font-medium mb-1">Требования к группе</label>
				<input className="input" value={data.group_requirements || ""} onChange={(e) => setData({ ...data, group_requirements: e.target.value })} />
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">URL схемы маршрута</label>
				<input className="input" value={data.route_image_url || ""} onChange={(e) => setData({ ...data, route_image_url: e.target.value })} />
			</div>
			<div className="md:col-span-3">
				<label className="block text-sm font-medium mb-1">Email контакта</label>
				<input className="input" value={data.contact_email || ""} onChange={(e) => setData({ ...data, contact_email: e.target.value })} />
			</div>
			<div className="md:col-span-3">
				<label className="block text-sm font-medium mb-1">Доступность</label>
				<div className="flex flex-wrap gap-3">
					{[
						{ key: "vision", label: "Для слабовидящих" },
						{ key: "hearing", label: "Для слабослышащих" },
						{ key: "mobility", label: "Для маломобильных" },
					].map((a) => {
						const acc = Array.isArray(data.accessibility) ? data.accessibility : [];
						const checked = acc.includes(a.key);
						return (
							<label key={a.key} className="inline-flex items-center gap-1 text-sm">
								<input type="checkbox" checked={checked}
									onChange={() => setData({ ...data, accessibility: checked ? acc.filter((k) => k !== a.key) : [...acc, a.key] })} />
								{a.label}
							</label>
						);
					})}
				</div>
			</div>
			<div className="md:col-span-3 flex flex-wrap gap-4">
				{[
					{ key: "ppe_required", label: "Нужны СИЗ" },
					{ key: "food_on_site", label: "Питание на месте" },
					{ key: "has_souvenirs", label: "Сувениры" },
					{ key: "has_degustation", label: "Дегустация" },
					{ key: "has_photo_spots", label: "Фотозоны" },
				].map((f) => (
					<label key={f.key} className="inline-flex items-center gap-1 text-sm">
						<input type="checkbox" checked={!!data[f.key]}
							onChange={() => setData({ ...data, [f.key]: !data[f.key] })} />
						{f.label}
					</label>
				))}
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Статус</label>
				<select className="input" value={data.status || "draft"} onChange={(e) => setData({ ...data, status: e.target.value })}>
					{STATUS_OPTIONS.filter((o) => o.value !== "blocked").map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
				</select>
			</div>
		</div>
	);
}

function PlacesTab({ placeList, loadData, placeFilter, setPlaceFilter, editPlace, setEditPlace, setMessage, REGION_LIST }) {
	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold">Места размещения, питания и досуга</h2>
				<button onClick={() => setEditPlace({ name: "", type: "hotel", address: "", site_url: "", vk_url: "", region: "" })} className="btn-primary text-sm">+ Добавить место</button>
			</div>
			<div className="flex gap-4 mb-6">
				<div className="flex-1">
					<select className="input" value={placeFilter.region} onChange={(e) => setPlaceFilter({ ...placeFilter, region: e.target.value })}>
						<option value="">Все регионы</option>
						{[...new Set(placeList.map((p) => p.region).filter(Boolean))].sort().map((r) => <option key={r} value={r}>{r}</option>)}
					</select>
				</div>
				<div className="flex-1">
					<select className="input" value={placeFilter.type} onChange={(e) => setPlaceFilter({ ...placeFilter, type: e.target.value })}>
						<option value="">Все типы</option>
						{["hotel", "restaurant", "museum", "theatre", "park", "mall"].map((t) => {
							const labels = { hotel: "🏨 Гостиницы", restaurant: "🍽️ Рестораны", museum: "🏛️ Музеи", theatre: "🎭 Театры", park: "🌳 Парки", mall: "🛒 ТРЦ" };
							return <option key={t} value={t}>{labels[t] || t}</option>;
						})}
					</select>
				</div>
				<button onClick={() => setPlaceFilter({ region: "", type: "" })} className="btn-outline">Сбросить</button>
			</div>
			{editPlace && (
				<div className="card p-6 mb-6">
					<h3 className="font-semibold mb-4">{editPlace.id ? "Редактировать место" : "Новое место"}</h3>
					<div className="grid md:grid-cols-2 gap-4 mb-4">
						<div><label className="block text-sm font-medium mb-1">Название *</label><input className="input" value={editPlace.name} onChange={(e) => setEditPlace({ ...editPlace, name: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">Тип</label>
							<select className="input" value={editPlace.type} onChange={(e) => setEditPlace({ ...editPlace, type: e.target.value })}>
								<option value="hotel">🏨 Гостиница</option><option value="restaurant">🍽️ Ресторан</option>
								<option value="museum">🏛️ Музей</option><option value="theatre">🎭 Театр</option>
								<option value="park">🌳 Парк</option><option value="mall">🛒 ТРЦ</option>
							</select></div>
						<div><label className="block text-sm font-medium mb-1">Адрес</label><input className="input" value={editPlace.address || ""} onChange={(e) => setEditPlace({ ...editPlace, address: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">Регион</label>
							<select className="input" value={editPlace.region || ""} onChange={(e) => setEditPlace({ ...editPlace, region: e.target.value })}>
								<option value="">— Выберите —</option>
								{REGION_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
							</select></div>
						<div><label className="block text-sm font-medium mb-1">Сайт</label><input className="input" value={editPlace.site_url || ""} onChange={(e) => setEditPlace({ ...editPlace, site_url: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">VK</label><input className="input" value={editPlace.vk_url || ""} onChange={(e) => setEditPlace({ ...editPlace, vk_url: e.target.value })} /></div>
					</div>
					<div className="flex gap-2">
						<button onClick={async () => {
							try {
								if (editPlace.id) { await placesApi.update(editPlace.id, editPlace); setMessage({ type: "success", text: "Место обновлено" }); }
								else { await placesApi.create(editPlace); setMessage({ type: "success", text: "Место создано" }); }
								setEditPlace(null); loadData();
							} catch (err) { setMessage({ type: "error", text: err.message }); }
						}} className="btn-primary text-sm">{editPlace.id ? "Сохранить" : "Создать"}</button>
						<button onClick={() => setEditPlace(null)} className="btn-outline text-sm">Отмена</button>
					</div>
				</div>
			)}
			<div className="space-y-3">
				{placeList.length === 0 ? (
					<div className="card p-12 text-center"><p className="text-gray-500">Нет мест</p></div>
				) : placeList.map((p) => (
					<div key={p.id} className="card p-4 flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<span className="text-lg">{p.type === "hotel" ? "🏨" : p.type === "restaurant" ? "🍽️" : p.type === "museum" ? "🏛️" : p.type === "theatre" ? "🎭" : p.type === "park" ? "🌳" : "🛒"}</span>
								<h3 className="font-semibold">{p.name}</h3>
								<span className="text-xs text-gray-400">{p.type}</span>
							</div>
							<p className="text-sm text-gray-500">{p.address}{p.region ? ` • ${p.region}` : ""}</p>
						</div>
						<div className="flex gap-2 shrink-0 ml-4">
							<button onClick={() => setEditPlace(p)} className="text-sm text-industrial-blue hover:underline">✏️</button>
							<button onClick={async () => {
								if (!window.confirm("Удалить место?")) return;
								try { await placesApi.delete(p.id); setMessage({ type: "success", text: "Место удалено" }); loadData(); }
								catch (err) { setMessage({ type: "error", text: err.message }); }
							}} className="text-sm text-red-500 hover:underline">🗑️</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function RegionsTab({ regions, loadData, editRegion, setEditRegion, saveRegion, deleteRegion, computeCentroid }) {
	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold">Регионы</h2>
				<button onClick={() => setEditRegion({ name: "", title: "", description: "", video_url: "", coords: "" })} className="btn-primary text-sm">+ Добавить регион</button>
			</div>
			{editRegion && (
				<div className="card p-6 mb-6">
					<h3 className="font-semibold mb-4">{editRegion.name ? "Редактировать регион" : "Новый регион"}</h3>
					<div className="grid md:grid-cols-2 gap-4 mb-4">
						<div><label className="block text-sm font-medium mb-1">Название</label><input className="input" value={editRegion.name} onChange={(e) => setEditRegion({ ...editRegion, name: e.target.value })} disabled={!!editRegion.originalName} /></div>
						<div><label className="block text-sm font-medium mb-1">Заголовок</label><input className="input" value={editRegion.title} onChange={(e) => setEditRegion({ ...editRegion, title: e.target.value })} /></div>
						<div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Описание</label><textarea className="input" rows="2" value={editRegion.description} onChange={(e) => setEditRegion({ ...editRegion, description: e.target.value })} /></div>
						<div className="md:col-span-2"><label className="block text-sm font-medium mb-1">URL видео</label><input className="input" value={editRegion.video_url} onChange={(e) => setEditRegion({ ...editRegion, video_url: e.target.value })} /></div>
						<div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Координаты</label>
							<div className="flex gap-2">
								<input className="input flex-1" value={editRegion.coords || ""} onChange={(e) => setEditRegion({ ...editRegion, coords: e.target.value })} />
								<button onClick={() => computeCentroid(editRegion.name)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">📍 Вычислить</button>
							</div>
						</div>
					</div>
					<div className="flex gap-2">
						<button onClick={saveRegion} className="btn-primary text-sm">{editRegion.originalName ? "Сохранить" : "Создать"}</button>
						<button onClick={() => setEditRegion(null)} className="btn-outline text-sm">Отмена</button>
					</div>
				</div>
			)}
			<div className="space-y-3">
				{regions.length === 0 ? (
					<div className="card p-12 text-center"><p className="text-gray-500">Нет регионов</p></div>
				) : regions.map((r) => (
					<div key={r.name} className="card p-4 flex items-start justify-between">
						<div className="flex-1">
							<h3 className="font-semibold">{r.title || r.name}</h3>
							<p className="text-sm text-gray-500">{r.name}</p>
						</div>
						<div className="flex gap-2 shrink-0 ml-4">
							<button onClick={() => setEditRegion({ name: r.name, originalName: r.name, title: r.title || "", description: r.description || "", video_url: r.video_url || "", coords: r.coords || "" })}
								className="text-sm text-industrial-blue hover:underline">✏️</button>
							<button onClick={() => deleteRegion(r.name)} className="text-sm text-red-500 hover:underline">🗑️</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function SettingsTab({ settings, setSettings, handleSaveSettings, handleTestVk, handleTestAi, settingsMsg }) {
	return (
		<div className="max-w-4xl">
			<div className="grid lg:grid-cols-2 gap-6">
				<div className="card p-6">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl">🤖</span>
						<div><h3 className="text-lg font-semibold">AI-ассистент</h3><p className="text-sm text-gray-500">Настройка подключения к языковой модели</p></div>
					</div>
					<div className="space-y-4">
						<div><label className="block text-sm font-medium mb-1">URL сервера LLM</label><input className="input" value={settings.llm_base_url || "https://api.openai.com/v1"} onChange={(e) => setSettings({ ...settings, llm_base_url: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">Ключ API</label><input className="input" type="password" value={settings.llm_api_key || ""} onChange={(e) => setSettings({ ...settings, llm_api_key: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">Модель</label><input className="input" value={settings.llm_model || "gpt-4o-mini"} onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })} /></div>
					</div>
					<div className="flex items-center gap-3 mt-4">
						<button onClick={() => handleSaveSettings(["llm_base_url", "llm_api_key", "llm_model"], "ai")} className="btn-primary">Сохранить</button>
						<button onClick={handleTestAi} className="btn-outline border-green-500 text-green-600">🤖 Тест</button>
						{settingsMsg.block === "ai" && <span className={`text-sm ${settingsMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{settingsMsg.text}</span>}
					</div>
				</div>
				<div className="card p-6">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl">🧠</span>
						<div><h3 className="text-lg font-semibold">Системный промпт</h3><p className="text-sm text-gray-500">Инструкции для AI-ассистента</p></div>
					</div>
					<div className="space-y-4">
						<div><label className="block text-sm font-medium mb-1">Роль ассистента</label><textarea className="input" rows="2" value={settings.llm_system_prompt_role || "Ты — умный помощник по подбору промышленных экскурсий."} onChange={(e) => setSettings({ ...settings, llm_system_prompt_role: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">Дополнительные инструкции</label><textarea className="input" rows="2" value={settings.llm_system_prompt_instructions || "Отвечай кратко. Предлагай 3-5 экскурсий с кратким объяснением."} onChange={(e) => setSettings({ ...settings, llm_system_prompt_instructions: e.target.value })} /></div>
					</div>
					<div className="flex items-center gap-3 mt-4">
						<button onClick={() => handleSaveSettings(["llm_system_prompt_role", "llm_system_prompt_instructions"], "prompt")} className="btn-primary">Сохранить</button>
						{settingsMsg.block === "prompt" && <span className={`text-sm ${settingsMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{settingsMsg.text}</span>}
					</div>
				</div>
				<div className="card p-6">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl">🎛️</span>
						<div><h3 className="text-lg font-semibold">Параметры генерации</h3><p className="text-sm text-gray-500">Настройки качества ответов модели</p></div>
					</div>
					<div className="space-y-4">
						<div><label className="block text-sm font-medium mb-1">Температура</label><input className="input" value={settings.llm_temperature || "0.7"} onChange={(e) => setSettings({ ...settings, llm_temperature: e.target.value })} placeholder="0.7" /></div>
						<div><label className="block text-sm font-medium mb-1">Макс. токенов</label><input className="input" value={settings.llm_max_tokens || "1000"} onChange={(e) => setSettings({ ...settings, llm_max_tokens: e.target.value })} placeholder="1000" /></div>
					</div>
					<div className="flex items-center gap-3 mt-4">
						<button onClick={() => handleSaveSettings(["llm_temperature", "llm_max_tokens"], "params")} className="btn-primary">Сохранить</button>
						{settingsMsg.block === "params" && <span className={`text-sm ${settingsMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{settingsMsg.text}</span>}
					</div>
				</div>
				<div className="card p-6">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-xl">💬</span>
						<div><h3 className="text-lg font-semibold">VK-уведомления</h3><p className="text-sm text-gray-500">Отправка уведомлений от имени сообщества</p></div>
					</div>
					<div className="space-y-4">
						<div><label className="block text-sm font-medium mb-1">Токен сообщества VK</label><input className="input" type="password" value={settings.vk_token || ""} onChange={(e) => setSettings({ ...settings, vk_token: e.target.value })} /></div>
						<div><label className="block text-sm font-medium mb-1">ID администратора VK</label><input className="input" value={settings.vk_admin_peer_id || ""} onChange={(e) => setSettings({ ...settings, vk_admin_peer_id: e.target.value })} placeholder="11631706" /></div>
					</div>
					<div className="flex items-center gap-3 mt-4">
						<button onClick={() => handleSaveSettings(["vk_token", "vk_admin_peer_id"], "vk")} className="btn-primary">Сохранить</button>
						<button onClick={handleTestVk} className="btn-outline border-green-500 text-green-600">📨 Тест</button>
						{settingsMsg.block === "vk" && <span className={`text-sm ${settingsMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{settingsMsg.text}</span>}
					</div>
				</div>
			</div>
		</div>
	);
}