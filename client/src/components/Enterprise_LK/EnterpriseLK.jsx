import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { enterpriseLK } from "../../api";

const PRODUCTION_TYPES = [
	"Строительное", "Пищевое", "Машиностроение",
	"Лёгкая промышленность", "IT-производство", "Энергетика", "Химическое",
];

const DURATION_OPTIONS = [
	{ value: "1h", label: "1 час" },
	{ value: "2h", label: "2 часа" },
	{ value: "half_day", label: "Полдня" },
	{ value: "full_day", label: "Полный день" },
];

const MIN_AGE_OPTIONS = [
	{ value: "6plus", label: "6+" },
	{ value: "12plus", label: "12+" },
	{ value: "18plus", label: "18+" },
];

const ACCESSIBILITY_OPTIONS = [
	{ value: "vision", label: "Нарушения зрения" },
	{ value: "hearing", label: "Нарушения слуха" },
	{ value: "mobility", label: "Нарушения ОДА" },
];

const STATUS_LABELS = {
	draft: { label: "Черновик", class: "bg-gray-100 text-gray-600" },
	pending: { label: "На модерации", class: "bg-yellow-100 text-yellow-700" },
	published: { label: "Опубликовано", class: "bg-green-100 text-green-700" },
	blocked: { label: "Заблокировано", class: "bg-red-100 text-red-700" },
};

export default function EnterpriseLK() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("analytics");
	const [profile, setProfile] = useState(null);
	const [tours, setTours] = useState([]);
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [editingTour, setEditingTour] = useState(null);
	const [form, setForm] = useState({
		name: "", region: "", address: "", production_type: "",
		description: "", site_url: "", vk_group_url: "", vk_photos_url: "",
		has_360: false, has_ar: false, coords: "",
		certifications: "", live_stats: "", souvenirs: "", professions: "", tags: "",
	});
	const [tourForm, setTourForm] = useState({
		title: "", description: "", duration: "2h", cost: 0,
		max_group_size: 20, min_age: "6plus",
		production_type: "", edu_program: "",
		accessibility: [], safety_instructions: "", group_requirements: "",
		interactivity_level: 5, physical_load: 5,
		ppe_required: false, food_on_site: false,
		has_souvenirs: false, has_degustation: false, has_photo_spots: false,
		tags: "", contact_email: "",
	});
	const [showTourForm, setShowTourForm] = useState(false);

	useEffect(() => {
		if (!user || user.role !== "enterprise") {
			navigate("/");
			return;
		}
		loadData();
	}, [user, activeTab]);

	const loadData = async () => {
		setLoading(true);
		try {
			if (activeTab === "analytics") {
				const analyticsData = await enterpriseLK.analytics();
				setAnalytics(analyticsData);
			}
			if (activeTab === "profile" || activeTab === "tours") {
				const [profileData, toursData] = await Promise.all([
					enterpriseLK.profile().catch(() => ({ enterprise: null })),
					enterpriseLK.tours().catch(() => ({ tours: [] })),
				]);
				setProfile(profileData.enterprise);
				setTours(toursData.tours || []);
				if (profileData.enterprise) {
					setForm({
						name: profileData.enterprise.name || "",
						region: profileData.enterprise.region || "",
						address: profileData.enterprise.address || "",
						production_type: profileData.enterprise.production_type || "",
						description: profileData.enterprise.description || "",
						site_url: profileData.enterprise.site_url || "",
						vk_group_url: profileData.enterprise.vk_group_url || "",
						vk_photos_url: profileData.enterprise.vk_photos_url || "",
						has_360: !!profileData.enterprise.has_360,
						has_ar: !!profileData.enterprise.has_ar,
						coords: profileData.enterprise.coords || "",
						panorama_url: profileData.enterprise.panorama_url || "",
						certifications: JSON.stringify(profileData.enterprise.certifications || []),
						live_stats: JSON.stringify(profileData.enterprise.live_stats || {}),
						souvenirs: JSON.stringify(profileData.enterprise.souvenirs || []),
						professions: JSON.stringify(profileData.enterprise.professions || []),
						tags: JSON.stringify(profileData.enterprise.tags || []),
					});
				}
			}
		} catch (err) {
			console.error("Load LK error:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveProfile = async (e) => {
		e.preventDefault();
		setSaving(true);
		setMessage({ type: "", text: "" });
		try {
			await enterpriseLK.updateProfile({
				...form,
				certifications: JSON.parse(form.certifications || "[]"),
				live_stats: JSON.parse(form.live_stats || "{}"),
				souvenirs: JSON.parse(form.souvenirs || "[]"),
				professions: JSON.parse(form.professions || "[]"),
				tags: JSON.parse(form.tags || "[]"),
			});
			setMessage({ type: "success", text: "Профиль предприятия обновлён" });
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		} finally {
			setSaving(false);
		}
	};

	const handleSaveTour = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const tourData = {
				...tourForm,
				cost: parseInt(tourForm.cost) || 0,
				max_group_size: parseInt(tourForm.max_group_size) || 20,
				interactivity_level: parseInt(tourForm.interactivity_level) || 5,
				physical_load: parseInt(tourForm.physical_load) || 5,
				tags: tourForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
			};

			if (editingTour) {
				await enterpriseLK.updateTour(editingTour.id, tourData);
				setMessage({ type: "success", text: "Экскурсия обновлена" });
			} else {
				await enterpriseLK.createTour(tourData);
				setMessage({ type: "success", text: "Экскурсия создана" });
			}
			setShowTourForm(false);
			setEditingTour(null);
			resetTourForm();
			const toursData = await enterpriseLK.tours();
			setTours(toursData.tours || []);
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteTour = async (id) => {
		if (!window.confirm("Удалить экскурсию?")) return;
		try {
			await enterpriseLK.deleteTour(id);
			setTours(tours.filter((t) => t.id !== id));
			setMessage({ type: "success", text: "Экскурсия удалена" });
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		}
	};

	const startEditTour = (tour) => {
		setEditingTour(tour);
		setTourForm({
			title: tour.title || "",
			description: tour.description || "",
			duration: tour.duration || "2h",
			cost: tour.cost || 0,
			max_group_size: tour.max_group_size || 20,
			min_age: tour.min_age || "6plus",
			production_type: tour.production_type || "",
			edu_program: tour.edu_program || "",
			accessibility: JSON.parse(tour.accessibility || "[]"),
			safety_instructions: tour.safety_instructions || "",
			group_requirements: tour.group_requirements || "",
			interactivity_level: tour.interactivity_level || 5,
			physical_load: tour.physical_load || 5,
			ppe_required: !!tour.ppe_required,
			food_on_site: !!tour.food_on_site,
			has_souvenirs: !!tour.has_souvenirs,
			has_degustation: !!tour.has_degustation,
			has_photo_spots: !!tour.has_photo_spots,
			tags: (tour.tags || []).join(", "),
			contact_email: tour.contact_email || "",
		});
		setShowTourForm(true);
	};

	const resetTourForm = () => {
		setTourForm({
			title: "", description: "", duration: "2h", cost: 0,
			max_group_size: 20, min_age: "6plus",
			production_type: "", edu_program: "",
			accessibility: [], safety_instructions: "", group_requirements: "",
			interactivity_level: 5, physical_load: 5,
			ppe_required: false, food_on_site: false,
			has_souvenirs: false, has_degustation: false, has_photo_spots: false,
			tags: "", contact_email: "",
		});
		setEditingTour(null);
	};

	if (!user) return null;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-2">Личный кабинет предприятия</h1>
			<p className="text-gray-500 mb-8">{user.email}</p>

			{message.text && (
				<div className={`mb-6 px-4 py-3 rounded-lg ${
					message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
				}`}>
					{message.text}
					<button onClick={() => setMessage({ type: "", text: "" })} className="float-right font-bold">&times;</button>
				</div>
			)}

			{/* Tabs */}
			<div className="flex gap-2 mb-8 border-b">
				{["analytics", "profile", "tours"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-6 py-3 font-medium transition-colors border-b-2 ${
							activeTab === tab
								? "border-primary-orange text-primary-orange"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						{tab === "analytics" && "📊 Аналитика"}
						{tab === "profile" && "🏭 Паспорт предприятия"}
						{tab === "tours" && "🎯 Экскурсии"}
					</button>
				))}
			</div>

			{loading ? (
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-orange mx-auto"></div>
				</div>
			) : activeTab === "analytics" ? (
				/* 📊 Analytics Dashboard */
				analytics ? (
					<div className="space-y-6">
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							<div className="card p-6 text-center">
								<div className="text-3xl font-bold text-primary-orange mb-1">{analytics.stats?.tours_count || 0}</div>
								<div className="text-sm text-gray-500">Экскурсий</div>
							</div>
							<div className="card p-6 text-center">
								<div className="text-3xl font-bold text-industrial-blue mb-1">{analytics.stats?.total_views || 0}</div>
								<div className="text-sm text-gray-500">Просмотров</div>
							</div>
							<div className="card p-6 text-center">
								<div className="text-3xl font-bold text-green-600 mb-1">{analytics.stats?.total_bookings || 0}</div>
								<div className="text-sm text-gray-500">Всего заявок</div>
							</div>
							<div className="card p-6 text-center">
								<div className="text-3xl font-bold text-blue-600 mb-1">{analytics.stats?.confirmed_bookings || 0}</div>
								<div className="text-sm text-gray-500">Подтверждено</div>
							</div>
							<div className="card p-6 text-center">
								<div className="text-3xl font-bold text-yellow-600 mb-1">{analytics.stats?.new_bookings || 0}</div>
								<div className="text-sm text-gray-500">Новых</div>
							</div>
						</div>

						{/* Tour popularity */}
						<div className="card p-6">
							<h2 className="text-lg font-semibold mb-4">Популярность экскурсий</h2>
							<div className="space-y-3">
								{(analytics.tours || []).map((tour) => (
									<div key={tour.id} className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="font-medium text-sm">{tour.title}</span>
												<span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[tour.status]?.class || "bg-gray-100"}`}>
													{STATUS_LABELS[tour.status]?.label || tour.status}
												</span>
											</div>
											<div className="flex gap-4 text-xs text-gray-500 mt-1">
												<span>👁 {tour.views_count} просмотров</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Recent bookings */}
						<div className="card p-6">
							<h2 className="text-lg font-semibold mb-4">Последние заявки</h2>
							{analytics.recent_bookings?.length > 0 ? (
								<div className="space-y-3">
									{analytics.recent_bookings.map((b) => (
										<div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
											<div>
												<p className="font-medium text-sm">{b.full_name}</p>
												<p className="text-xs text-gray-500">{b.tour_title} • {b.group_size} чел.</p>
											</div>
											<span className={`text-xs px-2 py-1 rounded-full ${
												b.status === "confirmed" ? "bg-green-100 text-green-700" :
												b.status === "new" ? "bg-yellow-100 text-yellow-700" :
												b.status === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100"
											}`}>
												{b.status === "confirmed" ? "Подтверждена" :
												 b.status === "new" ? "Новая" :
												 b.status === "reviewing" ? "На рассмотрении" :
												 b.status === "rejected" ? "Отклонена" : "Отменена"}
											</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 text-sm">Пока нет заявок</p>
							)}
						</div>
					</div>
				) : (
					<div className="card p-12 text-center">
						<p className="text-gray-500">Сначала заполните паспорт предприятия</p>
					</div>
				)
			) : activeTab === "profile" ? (
				/* 🏭 Profile Form */
				<div className="max-w-3xl">
					<form onSubmit={handleSaveProfile} className="space-y-6">
						<div className="card p-6">
							<h2 className="text-lg font-semibold mb-4">Основная информация</h2>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">Название *</label>
									<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Регион *</label>
									<input className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Адрес</label>
									<input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Тип производства *</label>
									<select className="input" value={form.production_type} onChange={(e) => setForm({ ...form, production_type: e.target.value })} required>
										<option value="">Выберите</option>
										{PRODUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
									</select>
								</div>
							</div>
							<div className="mt-4">
								<label className="block text-sm font-medium mb-1">Описание</label>
								<textarea className="input" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
							</div>
							<div className="mt-4">
								<label className="block text-sm font-medium mb-1">📍 Координаты на карте</label>
								<input className="input" value={form.coords} onChange={(e) => setForm({ ...form, coords: e.target.value })} placeholder="58.6000, 49.6800" />
								<p className="text-xs text-gray-400 mt-1">Широта, долгота через запятую. Например: 58.6000, 49.6800</p>
							</div>
						</div>

						<div className="card p-6">
							<h2 className="text-lg font-semibold mb-4">Контакты и ссылки</h2>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">Сайт</label>
									<input className="input" value={form.site_url} onChange={(e) => setForm({ ...form, site_url: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">VK группа</label>
									<input className="input" value={form.vk_group_url} onChange={(e) => setForm({ ...form, vk_group_url: e.target.value })} />
								</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">🌐 Ссылка на панораму (360°)</label>
								<input className="input" value={form.panorama_url || ""} onChange={(e) => setForm({ ...form, panorama_url: e.target.value })} placeholder="https://panorama.example.com/..." />
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">📸 Фотогалерея (URL через запятую)</label>
								<input className="input" value={form.vk_photos_url || ""} onChange={(e) => setForm({ ...form, vk_photos_url: e.target.value })} placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg" />
								<p className="text-xs text-gray-400 mt-1">Укажите ссылки на изображения через запятую</p>
							</div>
							</div>
							<div className="flex gap-4 mt-4">
								<label className="flex items-center gap-2">
									<input type="checkbox" checked={form.has_360} onChange={(e) => setForm({ ...form, has_360: e.target.checked })} />
									<span className="text-sm">Есть 360°-тур</span>
								</label>
								<label className="flex items-center gap-2">
									<input type="checkbox" checked={form.has_ar} onChange={(e) => setForm({ ...form, has_ar: e.target.checked })} />
									<span className="text-sm">Есть AR-контент</span>
								</label>
							</div>
						</div>

						<div className="card p-6">
							<h2 className="text-lg font-semibold mb-4">JSON-поля</h2>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-1">Сертификаты (JSON)</label>
									<textarea className="input font-mono text-xs" rows="3" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Живая статистика (JSON)</label>
									<textarea className="input font-mono text-xs" rows="3" value={form.live_stats} onChange={(e) => setForm({ ...form, live_stats: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Сувениры (JSON)</label>
									<textarea className="input font-mono text-xs" rows="2" value={form.souvenirs} onChange={(e) => setForm({ ...form, souvenirs: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Профессии (JSON)</label>
									<textarea className="input font-mono text-xs" rows="3" value={form.professions} onChange={(e) => setForm({ ...form, professions: e.target.value })} />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Теги (JSON-массив)</label>
									<textarea className="input font-mono text-xs" rows="2" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
								</div>
							</div>
						</div>

						<button type="submit" disabled={saving} className="btn-primary">
							{saving ? "Сохранение..." : "Сохранить профиль"}
						</button>
					</form>
				</div>
			) : (
				/* 🎯 Tours management */
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold">Экскурсии ({tours.length})</h2>
						<button onClick={() => { resetTourForm(); setShowTourForm(true); }} className="btn-primary">
							+ Новая экскурсия
						</button>
					</div>

					{/* Tour form */}
					{showTourForm && (
						<div className="card p-6 mb-6">
							<h3 className="text-lg font-semibold mb-4">
								{editingTour ? "Редактировать экскурсию" : "Новая экскурсия"}
							</h3>
							<form onSubmit={handleSaveTour} className="space-y-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">Название *</label>
										<input className="input" value={tourForm.title} onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })} required />
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Тип производства</label>
										<select className="input" value={tourForm.production_type} onChange={(e) => setTourForm({ ...tourForm, production_type: e.target.value })}>
											<option value="">Как у предприятия</option>
											{PRODUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Длительность</label>
										<select className="input" value={tourForm.duration} onChange={(e) => setTourForm({ ...tourForm, duration: e.target.value })}>
											{DURATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Стоимость (₽)</label>
										<input type="number" className="input" value={tourForm.cost} onChange={(e) => setTourForm({ ...tourForm, cost: e.target.value })} />
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Макс. группа</label>
										<input type="number" className="input" value={tourForm.max_group_size} onChange={(e) => setTourForm({ ...tourForm, max_group_size: e.target.value })} />
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Мин. возраст</label>
										<select className="input" value={tourForm.min_age} onChange={(e) => setTourForm({ ...tourForm, min_age: e.target.value })}>
											{MIN_AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Образовательная программа</label>
										<select className="input" value={tourForm.edu_program} onChange={(e) => setTourForm({ ...tourForm, edu_program: e.target.value })}>
											<option value="">Нет</option>
											<option value="Знакомство с производством">Знакомство с производством</option>
											<option value="Профориентация">Профориентация</option>
											<option value="Углублённые знания">Углублённые знания</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Контактный Email</label>
										<input type="email" className="input" value={tourForm.contact_email} onChange={(e) => setTourForm({ ...tourForm, contact_email: e.target.value })} />
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">Описание</label>
									<textarea className="input" rows="3" value={tourForm.description} onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })} />
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">Инструкция по ТБ</label>
										<textarea className="input" rows="2" value={tourForm.safety_instructions} onChange={(e) => setTourForm({ ...tourForm, safety_instructions: e.target.value })} />
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Требования к группе</label>
										<textarea className="input" rows="2" value={tourForm.group_requirements} onChange={(e) => setTourForm({ ...tourForm, group_requirements: e.target.value })} />
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<label className="flex items-center gap-2 text-sm">
										<input type="checkbox" checked={tourForm.ppe_required} onChange={(e) => setTourForm({ ...tourForm, ppe_required: e.target.checked })} />
										Нужны СИЗ
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input type="checkbox" checked={tourForm.food_on_site} onChange={(e) => setTourForm({ ...tourForm, food_on_site: e.target.checked })} />
										Питание на месте
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input type="checkbox" checked={tourForm.has_souvenirs} onChange={(e) => setTourForm({ ...tourForm, has_souvenirs: e.target.checked })} />
										Сувениры
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input type="checkbox" checked={tourForm.has_degustation} onChange={(e) => setTourForm({ ...tourForm, has_degustation: e.target.checked })} />
										Дегустация
									</label>
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">Теги (через запятую)</label>
										<input className="input" value={tourForm.tags} onChange={(e) => setTourForm({ ...tourForm, tags: e.target.value })} placeholder="бетон, строительство" />
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Доступность для ОВЗ</label>
										<div className="flex flex-wrap gap-3">
											{ACCESSIBILITY_OPTIONS.map((opt) => (
												<label key={opt.value} className="flex items-center gap-1 text-sm">
													<input type="checkbox" checked={tourForm.accessibility.includes(opt.value)}
														onChange={(e) => {
															const arr = e.target.checked
																? [...tourForm.accessibility, opt.value]
																: tourForm.accessibility.filter((v) => v !== opt.value);
															setTourForm({ ...tourForm, accessibility: arr });
														}}
													/>
													{opt.label}
												</label>
											))}
										</div>
									</div>
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-1">Интерактивность (1-10)</label>
										<input type="range" min="1" max="10" value={tourForm.interactivity_level}
											onChange={(e) => setTourForm({ ...tourForm, interactivity_level: parseInt(e.target.value) })} />
										<span className="text-sm text-gray-500">{tourForm.interactivity_level}/10</span>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Нагрузка (1-10)</label>
										<input type="range" min="1" max="10" value={tourForm.physical_load}
											onChange={(e) => setTourForm({ ...tourForm, physical_load: parseInt(e.target.value) })} />
										<span className="text-sm text-gray-500">{tourForm.physical_load}/10</span>
									</div>
								</div>

								<div className="flex gap-3">
									<button type="submit" disabled={saving} className="btn-primary">
										{saving ? "Сохранение..." : editingTour ? "Обновить" : "Создать"}
									</button>
									<button type="button" onClick={() => { setShowTourForm(false); setEditingTour(null); }} className="btn-outline">
										Отмена
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Tours list */}
					{tours.length === 0 ? (
						<div className="card p-12 text-center">
							<div className="text-4xl mb-4">🎯</div>
							<p className="text-gray-500 mb-4">У вас пока нет экскурсий</p>
							<button onClick={() => { resetTourForm(); setShowTourForm(true); }} className="btn-primary">Создать первую</button>
						</div>
					) : (
						<div className="space-y-4">
							{tours.map((tour) => (
								<div key={tour.id} className="card p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="text-lg font-semibold">{tour.title}</h3>
												<span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[tour.status]?.class || "bg-gray-100"}`}>
													{STATUS_LABELS[tour.status]?.label || tour.status}
												</span>
											</div>
											<p className="text-sm text-gray-500 mb-2 line-clamp-1">{tour.description}</p>
											<div className="flex gap-4 text-sm text-gray-600">
												<span>⏱ {DURATION_OPTIONS.find((o) => o.value === tour.duration)?.label || tour.duration}</span>
												<span>{tour.cost === 0 ? "Бесплатно" : `${tour.cost} ₽`}</span>
												<span>👥 до {tour.max_group_size}</span>
												<span>👁 {tour.views_count}</span>
											</div>
										</div>
										<div className="flex gap-2 ml-4">
											<button onClick={() => startEditTour(tour)} className="btn-outline text-sm px-3 py-1">✏️</button>
											<button onClick={() => handleDeleteTour(tour.id)} className="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-200 rounded-lg">🗑️</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}