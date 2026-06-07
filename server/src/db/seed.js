import bcrypt from "bcryptjs";
import { getDb, dbRun, dbGet, dbAll } from "./db.js";

const DEMO_ENTERPRISES = [
	{
		name: "КССК — Кировский Сельский Строительный Комбинат",
		region: "Кировская область",
		address: "г. Киров, Промышленная ул., 15",
		production_type: "Строительное",
		description:
			"Крупнейший производитель железобетонных изделий в Кировской области. История комбината началась в 1950-х годах, и сегодня это современное предприятие с автоматизированными линиями.",
		vk_photos_url: "https://vk.com/album-102969270",
		vk_video_url:
			"https://vkvideo.ru/video_ext.php?oid=-102969270&id=456239332&hash=cf67510540e9de8e&hd=4",
		site_url: "https://kssk.ru",
		vk_group_url: "https://vk.com/kssk_kirov",
		has_360: true,
		has_ar: false,
		panorama_url: "https://panorama.example.com/kssk",
		certifications: JSON.stringify([
			{ type: "safety", name: "ИСО 45001", year: 2023 },
			{ type: "quality", name: "ИСО 9001", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 72,
			emissions_tons: 0,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Магнит КССК", photo_url: "", buy_url: "" },
			{ name: "Блокнот с логотипом", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{
				name: "Оператор бетоноформовочной машины",
				skills: ["Работа с оборудованием", "Контроль качества"],
			},
			{
				name: "Инженер-технолог",
				skills: ["Проектирование", "Оптимизация процессов"],
			},
		]),
		tags: JSON.stringify([
			"бетон",
			"строительство",
			"ЖБИ",
			"производство панелей",
			"промышленный туризм",
		]),
		coords: "58.6000, 49.6800",
		status: "published",
	},
	{
		name: "Кондитерская фабрика «Дымка»",
		coords: "58.5950, 49.6500",
		region: "Кировская область",
		address: "г. Киров, Октябрьский пр., 92",
		production_type: "Пищевое",
		description:
			"Знаменитая кондитерская фабрика, производящая пряники и сладости с традиционными рецептами. Гостям предлагается дегустация продукции.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://dymka.ru",
		has_360: false,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "food", name: "ХАССП", year: 2022 },
		]),
		live_stats: JSON.stringify({
			noise_db: 65,
			emissions_tons: 0,
			accidents_5y: 1,
		}),
		souvenirs: JSON.stringify([
			{ name: "Пряники подарочные", photo_url: "", buy_url: "" },
			{ name: "Набор конфет", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Кондитер", skills: ["Выпечка", "Декорирование"] },
			{
				name: "Технолог пищевого производства",
				skills: ["Разработка рецептур", "Контроль качества"],
			},
		]),
		tags: JSON.stringify([
			"пряники",
			"дегустация",
			"пищевое производство",
			"сладости",
		]),
		status: "published",
	},
	{
		name: "Фабрика игрушек «Весна»",
		region: "Кировская область",
		address: "г. Киров, ул. Фабричная, 8",
		production_type: "Лёгкая промышленность",
		description:
			"Производство мягких игрушек и текстильной продукции. Фабрика работает с 1998 года и известна своими экологичными материалами.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://vesna-toys.ru",
		has_360: false,
		has_ar: true,
		certifications: JSON.stringify([
			{ type: "safety", name: "ТР ТС 008/2011", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 60,
			emissions_tons: 0,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Игрушка на выбор", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Швея", skills: ["Пошив", "Работа с тканью"] },
			{ name: "Дизайнер игрушек", skills: ["3D-моделирование", "Креатив"] },
		]),
		tags: JSON.stringify(["игрушки", "лёгкая промышленность", "для детей"]),
		coords: "58.6100, 49.6900",
		status: "published",
	},
	{
		name: "Агропромхолдинг «Дороничи»",
		coords: "58.4700, 49.9200",
		region: "Кировская область",
		address: "Кировская область, Куменский р-н, п. Дороничи",
		production_type: "Пищевое",
		description:
			"Крупнейший молочный комплекс региона. Современное автоматизированное производство с замкнутым циклом.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://doronichi.ru",
		has_360: true,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "food", name: "ХАССП", year: 2023 },
			{ type: "quality", name: "ISO 22000", year: 2022 },
		]),
		live_stats: JSON.stringify({
			noise_db: 68,
			emissions_tons: 0,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Набор молочной продукции", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{
				name: "Оператор доильного комплекса",
				skills: ["Работа с техникой", "Животноводство"],
			},
			{ name: "Технолог молока", skills: ["Переработка", "Контроль качества"] },
		]),
		tags: JSON.stringify([
			"молочное",
			"ферма",
			"сельское хозяйство",
			"экология",
		]),
		coords: "58.6050, 49.6700",
		status: "published",
	},
	{
		name: "Машзавод «Маяк»",
		coords: "58.6150, 49.6600",
		region: "Кировская область",
		address: "г. Киров, ул. Промышленная, 2",
		production_type: "Машиностроение",
		description:
			"Производство промышленного оборудования и металлоконструкций.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "",
		has_360: false,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "safety", name: "ИСО 45001", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 78,
			emissions_tons: 0.5,
			accidents_5y: 2,
		}),
		souvenirs: JSON.stringify([]),
		professions: JSON.stringify([
			{ name: "Токарь", skills: ["Обработка металла", "Чтение чертежей"] },
			{
				name: "Сварщик",
				skills: ["Сварочные работы", "Контроль качества швов"],
			},
			{ name: "Инженер-конструктор", skills: ["SolidWorks", "Проектирование"] },
		]),
		tags: JSON.stringify([
			"машиностроение",
			"металлообработка",
			"промышленное оборудование",
		]),
		coords: "58.6200, 49.6300",
		status: "published",
	},
	{
		name: "Вахруши-Литобувь",
		coords: "58.5500, 50.0500",
		region: "Кировская область",
		address: "г. Кирово-Чепецк, ул. Луначарского, 5",
		production_type: "Лёгкая промышленность",
		description:
			"Обувное производство полного цикла. Выпускает качественную обувь для всех возрастов.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://litoobuv.ru",
		has_360: false,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "quality", name: "ТР ТС 019/2011", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 65,
			emissions_tons: 0,
			accidents_5y: 1,
		}),
		souvenirs: JSON.stringify([
			{ name: "Сувенирная пара обуви", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Обувщик", skills: ["Пошив", "Работа с кожей"] },
			{
				name: "Модельер-конструктор",
				skills: ["Проектирование", "Моделирование"],
			},
		]),
		tags: JSON.stringify(["обувь", "лёгкая промышленность", "кожа"]),
		coords: "58.5800, 49.6800",
		status: "published",
	},
	{
		name: "IT-парк «ВятТех»",
		coords: "58.6000, 49.6200",
		region: "Кировская область",
		address: "г. Киров, ул. Горького, 5",
		production_type: "IT-производство",
		description: "Современный IT-парк с дата-центром и офисами разработки.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://vyattech.ru",
		has_360: true,
		has_ar: true,
		certifications: JSON.stringify([
			{ type: "security", name: "ISO 27001", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 45,
			emissions_tons: 0,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "USB-хаб с логотипом", photo_url: "", buy_url: "" },
			{ name: "Фирменная кружка", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Разработчик ПО", skills: ["Программирование", "Git"] },
			{ name: "Системный администратор", skills: ["Linux", "Сети"] },
		]),
		tags: JSON.stringify(["IT", "технологии", "программирование", "инновации"]),
		coords: "58.5900, 49.6500",
		status: "published",
	},
	{
		name: "Московский НПЗ (Газпром нефть)",
		coords: "55.6400, 37.7900",
		region: "Московская область",
		address: "г. Москва, Капотня, 2-й квартал, д. 3",
		production_type: "Энергетика",
		description:
			"Один из крупнейших нефтеперерабатывающих заводов России. Современное производство с автоматизированными системами управления.",
		vk_photos_url: "",
		vk_video_url: "https://vkvideo.ru/video_ext.php?oid=-102969270&id=456239332&hash=cf67510540e9de8e&hd=4",
		site_url: "https://mnpz.ru",
		vk_group_url: "",
		has_360: true,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "safety", name: "ISO 45001", year: 2024 },
			{ type: "quality", name: "ISO 9001", year: 2024 },
		]),
		live_stats: JSON.stringify({
			noise_db: 65,
			emissions_tons: 0.8,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Модель НПЗ", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Оператор НПУ", skills: ["Управление процессами", "Контроль качества"] },
			{ name: "Инженер-технолог", skills: ["Проектирование", "Оптимизация"] },
		]),
		tags: JSON.stringify(["нефть", "энергетика", "Москва", "инновации"]),
		coords: "55.6300, 37.7900",
		status: "published",
	},
	{
		name: "КАМАЗ — Автомобильный завод",
		coords: "55.7600, 52.4300",
		region: "Республика Татарстан",
		address: "г. Набережные Челны, пр. Автозаводский, 2",
		production_type: "Машиностроение",
		description:
			"Крупнейший производитель грузовых автомобилей в России. Конвейерная сборка, литейное производство, испытательный полигон.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://kamaz.ru",
		vk_group_url: "https://vk.com/kamaz",
		has_360: true,
		has_ar: true,
		certifications: JSON.stringify([
			{ type: "quality", name: "ISO 9001", year: 2024 },
			{ type: "safety", name: "ISO 45001", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 75,
			emissions_tons: 0.3,
			accidents_5y: 1,
		}),
		souvenirs: JSON.stringify([
			{ name: "Модель КАМАЗ", photo_url: "", buy_url: "" },
			{ name: "Фирменная кепка", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Сборщик автомобилей", skills: ["Конвейерная сборка", "Контроль качества"] },
			{ name: "Инженер-испытатель", skills: ["Тестирование", "Диагностика"] },
		]),
		tags: JSON.stringify(["автомобили", "машиностроение", "Татарстан", "конвейер"]),
		coords: "55.7700, 52.4400",
		status: "published",
	},
	{
		name: "Уралмашзавод",
		coords: "56.8300, 60.6000",
		region: "Свердловская область",
		address: "г. Екатеринбург, ул. Машиностроителей, 19",
		production_type: "Машиностроение",
		description:
			"Легендарный завод тяжёлого машиностроения. Производство экскаваторов, буровых установок и оборудования для горнодобывающей промышленности.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://uralmash.ru",
		vk_group_url: "",
		has_360: true,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "quality", name: "ISO 9001", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 80,
			emissions_tons: 0.5,
			accidents_5y: 2,
		}),
		souvenirs: JSON.stringify([
			{ name: "Модель экскаватора", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Токарь-расточник", skills: ["Металлообработка", "Чертежи"] },
			{ name: "Инженер-конструктор", skills: ["SolidWorks", "Расчёты"] },
		]),
		tags: JSON.stringify(["тяжёлое машиностроение", "Урал", "экскаваторы", "металл"]),
		coords: "56.8400, 60.6100",
		status: "published",
	},
	{
		name: "Кондитерская фабрика «Красный Октябрь»",
		coords: "55.7900, 37.5800",
		region: "Московская область",
		address: "г. Москва, ул. Ленинградская, 15",
		production_type: "Пищевое",
		description:
			"Старейшая кондитерская фабрика России. Производство шоколада, конфет и карамели по классическим рецептам с 1851 года.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://www.konfety.ru",
		vk_group_url: "",
		has_360: false,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "food", name: "ХАССП", year: 2024 },
		]),
		live_stats: JSON.stringify({
			noise_db: 55,
			emissions_tons: 0,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Подарочный набор конфет", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Шоколатье", skills: ["Приготовление шоколада", "Темперирование"] },
			{ name: "Упаковщик", skills: ["Упаковка", "Контроль качества"] },
		]),
		tags: JSON.stringify(["шоколад", "конфеты", "Москва", "дегустация"]),
		coords: "55.7800, 37.5900",
		status: "published",
	},
	{
		name: "Атоммаш — Завод атомного оборудования",
		coords: "47.5200, 42.1700",
		region: "Ростовская область",
		address: "г. Волгодонск, ул. Жуковского, 10",
		production_type: "Энергетика",
		description:
			"Производство оборудования для атомных электростанций. Реакторы, парогенераторы, теплообменники.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://atomash.ru",
		vk_group_url: "",
		has_360: true,
		has_ar: true,
		certifications: JSON.stringify([
			{ type: "safety", name: "ISO 45001", year: 2024 },
			{ type: "quality", name: "ISO 9001", year: 2024 },
		]),
		live_stats: JSON.stringify({
			noise_db: 70,
			emissions_tons: 0.1,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Модель реактора", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Сварщик атомного оборудования", skills: ["Аргонная сварка", "Контроль качества"] },
			{ name: "Инженер-атомщик", skills: ["Ядерная физика", "Расчёты"] },
		]),
		tags: JSON.stringify(["атом", "энергетика", "Ростов", "реакторы"]),
		coords: "47.5300, 42.1800",
		status: "published",
	},
	{
		name: "Пивоваренная компания «Балтика»",
		coords: "59.9400, 30.4000",
		region: "Ленинградская область",
		address: "г. Санкт-Петербург, пр. Шаумяна, 30",
		production_type: "Пищевое",
		description:
			"Крупнейший пивоваренный завод России. Автоматизированные линии розлива, лаборатория качества, дегустационный зал.",
		vk_photos_url: "",
		vk_video_url: "",
		site_url: "https://corporate.baltika.ru",
		vk_group_url: "https://vk.com/baltika",
		has_360: true,
		has_ar: false,
		certifications: JSON.stringify([
			{ type: "food", name: "ХАССП", year: 2024 },
			{ type: "quality", name: "ISO 9001", year: 2023 },
		]),
		live_stats: JSON.stringify({
			noise_db: 62,
			emissions_tons: 0.2,
			accidents_5y: 0,
		}),
		souvenirs: JSON.stringify([
			{ name: "Фирменный бокал", photo_url: "", buy_url: "" },
			{ name: "Набор пива", photo_url: "", buy_url: "" },
		]),
		professions: JSON.stringify([
			{ name: "Пивовар", skills: ["Варка", "Контроль качества"] },
			{ name: "Технолог брожения", skills: ["Микробиология", "Рецептуры"] },
		]),
		tags: JSON.stringify(["пиво", "напитки", "Санкт-Петербург", "дегустация"]),
		coords: "59.9500, 30.4100",
		status: "published",
	},
];

const DEMO_TOURS = [
	{
		enterprise_id: 1,
		title: "Путь бетона: от замеса до панели",
		description:
			"Увлекательная экскурсия по производству железобетонных изделий.",
		duration: "2h",
		cost: 0,
		max_group_size: 25,
		min_age: "6plus",
		production_type: "Строительное",
		edu_program: "Знакомство с производством",
		accessibility: JSON.stringify([]),
		safety_instructions: "При посещении цеха необходимо надеть каску.",
		group_requirements: "Группа не более 25 человек",
		interactivity_level: 8,
		physical_load: 4,
		ppe_required: true,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["бетон", "строительство", "промышленность"]),
		contact_email: "tour@kssk.ru",
		status: "published",
	},
	{
		enterprise_id: 1,
		title: "Мир ЖБИ: технологии и инновации",
		description: "Глубокое погружение в технологический процесс производства.",
		duration: "full_day",
		cost: 500,
		max_group_size: 15,
		min_age: "12plus",
		production_type: "Строительное",
		edu_program: "Углублённые знания",
		accessibility: JSON.stringify([]),
		safety_instructions: "Обязательно наличие закрытой обуви и каски.",
		interactivity_level: 9,
		physical_load: 6,
		ppe_required: true,
		food_on_site: true,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["бетон", "технологии", "инновации", "инженерия"]),
		contact_email: "tour@kssk.ru",
		status: "published",
	},
	{
		enterprise_id: 2,
		title: "Сладкий мир Дымки",
		description: "Ароматная экскурсия по кондитерской фабрике с дегустацией.",
		duration: "2h",
		cost: 300,
		max_group_size: 20,
		min_age: "6plus",
		production_type: "Пищевое",
		edu_program: "Профориентация",
		accessibility: JSON.stringify(["vision", "hearing", "mobility"]),
		safety_instructions: "Перед экскурсией необходимо вымыть руки.",
		interactivity_level: 7,
		physical_load: 2,
		ppe_required: false,
		food_on_site: true,
		has_souvenirs: true,
		has_degustation: true,
		has_photo_spots: true,
		tags: JSON.stringify(["пряники", "дегустация", "конфеты", "сладкое"]),
		contact_email: "info@dymka.ru",
		status: "published",
	},
	{
		enterprise_id: 3,
		title: "Как рождается игрушка",
		description: "Познакомьтесь с процессом создания мягких игрушек.",
		duration: "1h",
		cost: 200,
		max_group_size: 15,
		min_age: "6plus",
		production_type: "Лёгкая промышленность",
		edu_program: "Профориентация",
		accessibility: JSON.stringify(["vision", "hearing", "mobility"]),
		safety_instructions: "Соблюдайте чистоту в производственных помещениях.",
		interactivity_level: 8,
		physical_load: 1,
		ppe_required: false,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["игрушки", "текстиль", "креатив"]),
		contact_email: "tour@vesna-toys.ru",
		status: "published",
	},
	{
		enterprise_id: 4,
		title: "От коровы до прилавка",
		description: "Современное молочное производство с полным циклом.",
		duration: "half_day",
		cost: 500,
		max_group_size: 30,
		min_age: "6plus",
		production_type: "Пищевое",
		edu_program: "Профориентация",
		accessibility: JSON.stringify([]),
		safety_instructions: "При входе на ферму наденьте бахилы.",
		interactivity_level: 9,
		physical_load: 5,
		ppe_required: true,
		food_on_site: true,
		has_souvenirs: true,
		has_degustation: true,
		has_photo_spots: true,
		tags: JSON.stringify([
			"молочное",
			"ферма",
			"сельское хозяйство",
			"экология",
		]),
		contact_email: "tour@doronichi.ru",
		status: "published",
	},
	{
		enterprise_id: 5,
		title: "Тайны металлообработки",
		description: "Экскурсия по цехам машиностроительного завода.",
		duration: "2h",
		cost: 0,
		max_group_size: 10,
		min_age: "18plus",
		production_type: "Машиностроение",
		edu_program: "Углублённые знания",
		accessibility: JSON.stringify([]),
		safety_instructions: "Обязательно: каска, закрытая обувь, спецовка.",
		interactivity_level: 10,
		physical_load: 7,
		ppe_required: true,
		food_on_site: false,
		has_souvenirs: false,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify([
			"машиностроение",
			"металл",
			"станки",
			"производство",
		]),
		contact_email: "tour@mayak-kirov.ru",
		status: "published",
	},
	{
		enterprise_id: 7,
		title: "Цифровой мир IT",
		description:
			"Экскурсия по современному IT-парку: дата-центр, офисы разработки.",
		duration: "2h",
		cost: 0,
		max_group_size: 20,
		min_age: "12plus",
		production_type: "IT-производство",
		edu_program: "Профориентация",
		accessibility: JSON.stringify(["vision", "hearing", "mobility"]),
		safety_instructions: "Соблюдайте тишину в рабочих зонах.",
		interactivity_level: 8,
		physical_load: 1,
		ppe_required: false,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["IT", "технологии", "программирование", "роботы"]),
		contact_email: "tour@vyattech.ru",
		status: "published",
	},
	// Новые туры для предприятий 8-13
	{
		enterprise_id: 8,
		title: "Нефтепереработка: от сырья до бензина",
		description: "Экскурсия по Московскому НПЗ с посещением установок каталитического крекинга и лаборатории качества.",
		duration: "2h",
		cost: 0,
		max_group_size: 20,
		min_age: "12plus",
		production_type: "Энергетика",
		edu_program: "Углублённые знания",
		accessibility: JSON.stringify([]),
		safety_instructions: "Обязательно: каска, спецобувь, халат. Запрещено использовать телефон в цехах.",
		group_requirements: "Группа не более 20 человек",
		interactivity_level: 7,
		physical_load: 3,
		ppe_required: true,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["нефть", "Москва", "технологии", "энергетика"]),
		contact_email: "tour@mnpz.ru",
		status: "published",
	},
	{
		enterprise_id: 9,
		title: "Конвейерная сборка КАМАЗа",
		description: "Полный цикл сборки грузового автомобиля: от штамповки до тестового заезда.",
		duration: "full_day",
		cost: 1000,
		max_group_size: 15,
		min_age: "12plus",
		production_type: "Машиностроение",
		edu_program: "Профориентация",
		accessibility: JSON.stringify(["hearing", "mobility"]),
		safety_instructions: "Наденьте каску и жилет. Следуйте за экскурсоводом.",
		group_requirements: "Закрытая обувь обязательна",
		interactivity_level: 9,
		physical_load: 6,
		ppe_required: true,
		food_on_site: true,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["автомобили", "конвейер", "Татарстан", "инженерия"]),
		contact_email: "excursion@kamaz.ru",
		status: "published",
	},
	{
		enterprise_id: 9,
		title: "Музей истории КАМАЗа",
		description: "Экскурсия по музею завода: от первого грузовика до современного модельного ряда.",
		duration: "1h",
		cost: 200,
		max_group_size: 30,
		min_age: "6plus",
		production_type: "Машиностроение",
		edu_program: "Знакомство с производством",
		accessibility: JSON.stringify(["vision", "hearing", "mobility"]),
		safety_instructions: "Экскурсия безопасна, проводится в музее.",
		interactivity_level: 6,
		physical_load: 1,
		ppe_required: false,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["история", "автомобили", "музей"]),
		contact_email: "museum@kamaz.ru",
		status: "published",
	},
	{
		enterprise_id: 10,
		title: "Тяжёлое машиностроение Урала",
		description: "Экскурсия по цехам Уралмаша: производство экскаваторов и уникальных металлоконструкций.",
		duration: "half_day",
		cost: 0,
		max_group_size: 12,
		min_age: "18plus",
		production_type: "Машиностроение",
		edu_program: "Углублённые знания",
		accessibility: JSON.stringify([]),
		safety_instructions: "Строго: каска, спецобувь, средства защиты слуха.",
		group_requirements: "Группа до 12 человек",
		interactivity_level: 10,
		physical_load: 8,
		ppe_required: true,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["Урал", "тяжёлое машиностроение", "экскаваторы", "металл"]),
		contact_email: "tour@uralmash.ru",
		status: "published",
	},
	{
		enterprise_id: 11,
		title: "Шоколадная сказка",
		description: "Экскурсия по старейшей кондитерской фабрике с дегустацией свежего шоколада.",
		duration: "2h",
		cost: 500,
		max_group_size: 20,
		min_age: "6plus",
		production_type: "Пищевое",
		edu_program: "Профориентация",
		accessibility: JSON.stringify(["vision", "hearing", "mobility"]),
		safety_instructions: "Перед входом в цех наденьте бахилы и колпак.",
		interactivity_level: 7,
		physical_load: 2,
		ppe_required: false,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: true,
		has_photo_spots: true,
		tags: JSON.stringify(["шоколад", "дегустация", "Москва", "сладкое"]),
		contact_email: "excursion@konfety.ru",
		status: "published",
	},
	{
		enterprise_id: 12,
		title: "Атомная мощь России",
		description: "Экскурсия на завод атомного машиностроения: от чертежа до готового реактора.",
		duration: "full_day",
		cost: 0,
		max_group_size: 15,
		min_age: "18plus",
		production_type: "Энергетика",
		edu_program: "Углублённые знания",
		accessibility: JSON.stringify([]),
		safety_instructions: "Строгий пропускной режим. Запрещено проносить электронику.",
		group_requirements: "Предварительная запись за 2 недели",
		interactivity_level: 9,
		physical_load: 5,
		ppe_required: true,
		food_on_site: true,
		has_souvenirs: true,
		has_degustation: false,
		has_photo_spots: true,
		tags: JSON.stringify(["атом", "энергетика", "Ростов", "реакторы", "инновации"]),
		contact_email: "tour@atomash.ru",
		status: "published",
	},
	{
		enterprise_id: 13,
		title: "Тайны пивоварения",
		description: "Экскурсия по пивоваренному заводу: от варки до розлива. Дегустация свежего пива.",
		duration: "2h",
		cost: 800,
		max_group_size: 20,
		min_age: "18plus",
		production_type: "Пищевое",
		edu_program: "Профориентация",
		accessibility: JSON.stringify(["hearing", "mobility"]),
		safety_instructions: "Дегустация только для лиц старше 18 лет.",
		interactivity_level: 8,
		physical_load: 2,
		ppe_required: false,
		food_on_site: true,
		has_souvenirs: true,
		has_degustation: true,
		has_photo_spots: true,
		tags: JSON.stringify(["пиво", "Санкт-Петербург", "дегустация", "напитки"]),
		contact_email: "tour@baltika.ru",
		status: "published",
	},
	{
		enterprise_id: 13,
		title: "Лаборатория качества Балтики",
		description: "Посещение лаборатории контроля качества: как тестируют пиво и напитки.",
		duration: "1h",
		cost: 300,
		max_group_size: 15,
		min_age: "18plus",
		production_type: "Пищевое",
		edu_program: "Углублённые знания",
		accessibility: JSON.stringify(["vision", "hearing"]),
		safety_instructions: "Запрещено трогать оборудование лаборатории.",
		interactivity_level: 6,
		physical_load: 1,
		ppe_required: false,
		food_on_site: false,
		has_souvenirs: true,
		has_degustation: true,
		has_photo_spots: false,
		tags: JSON.stringify(["качество", "лаборатория", "напитки", "технологии"]),
		contact_email: "tour@baltika.ru",
		status: "published",
	},
];

const DEMO_PLACES = [
	{
		name: "Гостиница «Вятка»",
		type: "hotel",
		address: "г. Киров, ул. Карла Маркса, 71",
		site_url: "https://hotelvyatka.ru",
		region: "Кировская область",
	},
	{
		name: "Elements Kirov",
		type: "hotel",
		address: "г. Киров, Октябрьский пр., 147",
		site_url: "https://elementshotel.ru",
		region: "Кировская область",
	},
	{
		name: "Гостиница «Вятка Центр»",
		type: "hotel",
		address: "г. Киров, ул. Московская, 80",
		site_url: "",
		region: "Кировская область",
	},
	{
		name: "Ресторан «Васнецовъ»",
		type: "restaurant",
		address: "г. Киров, ул. Ленина, 96",
		site_url: "https://vasnetsov.rest",
		region: "Кировская область",
	},
	{
		name: "Ресторан «Острова»",
		type: "restaurant",
		address: "г. Киров, ул. Дерендяева, 27",
		vk_url: "https://vk.com/ostrova_kirov",
		region: "Кировская область",
	},
	{
		name: "Кафе «Куркума»",
		type: "restaurant",
		address: "г. Киров, ул. ТЦ «Макси»",
		vk_url: "https://vk.com/cafe_kurkuma",
		region: "Кировская область",
	},
	{
		name: "Музей истории Хлынова",
		type: "museum",
		address: "г. Киров, ул. Московская, 6",
		site_url: "https://музей-истории-хлынова.рф",
		region: "Кировская область",
	},
	{
		name: "Музей воинской славы",
		type: "museum",
		address: "г. Киров, ул. Кропотова, 2",
		site_url: "https://museum-kirov.ru",
		region: "Кировская область",
	},
	{
		name: "Театр на Спасской",
		type: "theatre",
		address: "г. Киров, ул. Спасская, 16",
		site_url: "https://teatrspasskaya.ru",
		region: "Кировская область",
	},
	{
		name: "Кировский драмтеатр",
		type: "theatre",
		address: "г. Киров, ул. Московская, 24",
		site_url: "https://dramteatr.ru",
		region: "Кировская область",
	},
	{
		name: "Парк «МультиЛэнд»",
		type: "park",
		address: "г. Киров, ул. Ленина, 105",
		site_url: "https://multiland-kirov.ru",
		region: "Кировская область",
	},
	{
		name: "Парк «Юркин парк»",
		type: "park",
		address: "г. Киров, ул. Свердлова, 8",
		vk_url: "https://vk.com/yurkinpark",
		region: "Кировская область",
	},
	{
		name: "ТРЦ «Макси»",
		type: "mall",
		address: "г. Киров, ул. Воровского, 135",
		site_url: "https://maxi-kirov.ru",
		region: "Кировская область",
	},
	{
		name: "ТРЦ «Время простора»",
		type: "mall",
		address: "г. Киров, Октябрьский пр., 24",
		site_url: "https://vremyakirov.ru",
		region: "Кировская область",
	},
];

const DEFAULT_SETTINGS = {
	llm_base_url: "https://api.openai.com/v1",
	llm_api_key: "",
	llm_model: "gpt-4o-mini",
	llm_system_prompt_role:
		"Ты — умный помощник по подбору промышленных экскурсий.",
	llm_system_prompt_instructions:
		"Отвечай кратко. Предлагай 3-5 экскурсий с кратким объяснением.",
	llm_temperature: "0.7",
	llm_max_tokens: "1000",
	llm_rate_limit: "10",
	vk_token: "",
	vk_admin_peer_id: "",
	vk_template_new_booking:
		"📩 Новая заявка!\n\n👤 {user_name}\n📍 {tour_name}\n📅 Дата: {date}\n👥 Количество: {count}",
	vk_template_status_change: "📋 Статус заявки изменён на: {status}",
	vk_notifications_enabled: "false",
};

const DEMO_REGIONS = [
	{
		name: "Кировская область",
		title: "Кировская область — промышленное сердце Вятки",
		description: "Откройте для себя промышленный потенциал Кировской области: от стройкомбината до IT-парка. 7+ предприятий ждут вас!",
		video_url: "https://vkvideo.ru/video_ext.php?oid=-102969270&id=456239332&hash=cf67510540e9de8e&hd=4",
		coords: "[58.6, 49.65]",
	},
	{
		name: "Московская область",
		title: "Московская область — промышленный центр России",
		description: "Нефтепереработка, машиностроение, кондитерское производство — всё это в Подмосковье. Московский НПЗ, Красный Октябрь и другие гиганты.",
		video_url: "",
		coords: "[55.75, 37.62]",
	},
	{
		name: "Республика Татарстан",
		title: "Татарстан — республика промышленных гигантов",
		description: "КАМАЗ, нефтехимия, авиастроение — промышленная мощь Татарстана. Конвейерная сборка легендарных грузовиков.",
		video_url: "",
		coords: "[55.8, 49.1]",
	},
	{
		name: "Свердловская область",
		title: "Свердловская область — опорный край державы",
		description: "Уралмаш, металлургия, тяжёлое машиностроение — промышленность Урала. Легендарные заводы Екатеринбурга.",
		video_url: "",
		coords: "[56.85, 60.61]",
	},
	{
		name: "Ростовская область",
		title: "Ростовская область — южный промышленный форпост",
		description: "Атомное машиностроение, сельхозтехника, энергетика юга России. Атоммаш — сердце атомной промышленности.",
		video_url: "",
		coords: "[47.24, 39.71]",
	},
	{
		name: "Ленинградская область",
		title: "Ленинградская область — промышленность Северной столицы",
		description: "Пивоварение, судостроение, машиностроение Санкт-Петербурга и области. Балтика — лидер пивоварения.",
		video_url: "",
		coords: "[59.93, 30.32]",
	},
];

export async function seedDatabase() {
	console.log("🌱 Заполнение базы данных демо-данными...");

	// Check if data already exists
	const userCount = await dbGet("SELECT COUNT(*) as count FROM users");
	if (userCount?.count > 0) {
		console.log("⏭️ Данные уже существуют, пропускаем seed");
		return false;
	}

	// Create admin user
	const adminPassword = await bcrypt.hash("admin123", 12);
	await dbRun(
		"INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)",
		["admin@promorientir.ru", adminPassword, "admin", "Администратор"],
	);
	console.log("✅ Создан администратор: admin@promorientir.ru / admin123");

	// Create enterprise users and enterprises
	for (let i = 0; i < DEMO_ENTERPRISES.length; i++) {
		const enterprise = DEMO_ENTERPRISES[i];

		// Create user for enterprise
		const userPassword = await bcrypt.hash("enterprise123", 12);
		const result = await dbRun(
			"INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)",
			[
				`enterprise${i + 1}@demo.ru`,
				userPassword,
				"enterprise",
				enterprise.name,
			],
		);
		const userId = result.lastID;

		// Create enterprise
		await dbRun(
			`INSERT INTO enterprises (user_id, name, region, address, production_type, description, 
       vk_photos_url, vk_video_url, site_url, vk_group_url, has_360, has_ar, panorama_url, coords, certifications,
       live_stats, souvenirs, professions, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				userId,
				enterprise.name,
				enterprise.region,
				enterprise.address,
				enterprise.production_type,
				enterprise.description,
				enterprise.vk_photos_url,
				enterprise.vk_video_url,
				enterprise.site_url,
				enterprise.vk_group_url,
				enterprise.has_360 ? 1 : 0,
				enterprise.has_ar ? 1 : 0,
				enterprise.panorama_url || "",
				enterprise.coords || "",
				enterprise.certifications,
				enterprise.live_stats,
				enterprise.souvenirs,
				enterprise.professions,
				enterprise.tags,
				enterprise.status,
			],
		);
	}
	console.log(`✅ Создано ${DEMO_ENTERPRISES.length} предприятий`);

	// Create tours
	for (const tour of DEMO_TOURS) {
		await dbRun(
			`INSERT INTO tours (enterprise_id, title, description, duration, cost, max_group_size, min_age,
       production_type, edu_program, accessibility, safety_instructions, group_requirements,
       interactivity_level, physical_load, ppe_required, food_on_site, has_souvenirs, has_degustation,
       has_photo_spots, tags, contact_email, status, views_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				tour.enterprise_id,
				tour.title,
				tour.description,
				tour.duration,
				tour.cost,
				tour.max_group_size,
				tour.min_age,
				tour.production_type,
				tour.edu_program,
				tour.accessibility,
				tour.safety_instructions || "",
				tour.group_requirements || "",
				tour.interactivity_level,
				tour.physical_load,
				tour.ppe_required ? 1 : 0,
				tour.food_on_site ? 1 : 0,
				tour.has_souvenirs ? 1 : 0,
				tour.has_degustation ? 1 : 0,
				tour.has_photo_spots ? 1 : 0,
				tour.tags,
				tour.contact_email,
				tour.status,
				Math.floor(Math.random() * 500) + 50,
			],
		);
	}
	console.log(`✅ Создано ${DEMO_TOURS.length} экскурсий`);

	// Create places
	for (const place of DEMO_PLACES) {
		await dbRun(
			"INSERT INTO places (name, type, address, site_url, vk_url, region) VALUES (?, ?, ?, ?, ?, ?)",
			[
				place.name,
				place.type,
				place.address,
				place.site_url || "",
				place.vk_url || "",
				place.region,
			],
		);
	}
	console.log(`✅ Создано ${DEMO_PLACES.length} мест`);

	// Create settings
	for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
		await dbRun("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [
			key,
			value,
		]);
	}
	console.log("✅ Настройки созданы");

	// Create regions
	for (const region of DEMO_REGIONS) {
		await dbRun(
			"INSERT OR REPLACE INTO regions (name, title, description, video_url, coords) VALUES (?, ?, ?, ?, ?)",
			[region.name, region.title, region.description, region.video_url, region.coords || ""],
		);
	}
	console.log(`✅ Создано ${DEMO_REGIONS.length} регионов`);

	// Create some demo bookings
	const toursData = await dbAll("SELECT id, enterprise_id FROM tours LIMIT 5");
	for (const tourItem of toursData) {
		await dbRun(
			`INSERT INTO bookings (tour_id, full_name, email, phone, group_size, desired_date, 
       status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				tourItem.id,
				"Иванов Иван Иванович",
				"ivan@example.com",
				"89001234567",
				Math.floor(Math.random() * 20) + 5,
				"2026-07-15",
				"confirmed",
				"paid",
			],
		);
		await dbRun(
			`INSERT INTO bookings (tour_id, full_name, email, phone, group_size, desired_date, 
       status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				tourItem.id,
				"Петрова Мария Сергеевна",
				"maria@example.com",
				"89012345678",
				Math.floor(Math.random() * 15) + 3,
				"2026-07-20",
				"reviewing",
				"pending",
			],
		);
	}
	console.log("✅ Демо-заявки созданы");

	console.log("🎉 Демо-данные загружены успешно!");
	return true;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase()
		.then(() => process.exit(0))
		.catch((err) => {
			console.error("❌ Ошибка seed:", err);
			process.exit(1);
		});
}

export default seedDatabase;
