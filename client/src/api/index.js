const API_BASE = "/api";

function getToken() {
	return localStorage.getItem("token");
}

async function request(endpoint, options = {}) {
	const token = getToken();
	const headers = {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	const response = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: "Ошибка запроса" }));
		throw new Error(error.error || "Ошибка запроса");
	}

	return response.json();
}

// Auth
export const auth = {
	login: (data) =>
		request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
	register: (data) =>
		request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
	me: () => request("/auth/me"),
};

// Enterprises
export const enterprises = {
	list: (params = {}) => {
		const query = new URLSearchParams(params).toString();
		return request(`/enterprises${query ? `?${query}` : ""}`);
	},
	get: (id) => request(`/enterprises/${id}`),
	regions: () => request("/enterprises/meta/regions"),
	types: () => request("/enterprises/meta/production-types"),
};

// Tours
export const tours = {
	list: (params = {}) => {
		const query = new URLSearchParams(params).toString();
		return request(`/tours${query ? `?${query}` : ""}`);
	},
	get: (id) => request(`/tours/${id}`),
	filters: (params = {}) => {
		const query = new URLSearchParams(params).toString();
		return request(`/tours/meta/filters${query ? `?${query}` : ""}`);
	},
	cascade: (params = {}) => {
		const query = new URLSearchParams(params).toString();
		return request(`/tours/meta/cascade${query ? `?${query}` : ""}`);
	},
};

// Bookings
export const bookings = {
	create: (data) =>
		request("/bookings", { method: "POST", body: JSON.stringify(data) }),
	list: () => request("/bookings"),
	updateStatus: (id, status) =>
		request(`/bookings/${id}/status`, {
			method: "PATCH",
			body: JSON.stringify({ status }),
		}),
};

// Places
export const places = {
	list: (params = {}) => {
		const clean = Object.fromEntries(
			Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
		);
		const query = new URLSearchParams(clean).toString();
		return request(`/places${query ? `?${query}` : ""}`);
	},
	types: () => request("/places/types"),
	create: (data) =>
		request("/places", { method: "POST", body: JSON.stringify(data) }),
	update: (id, data) =>
		request(`/places/${id}`, { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) =>
		request(`/places/${id}`, { method: "DELETE" }),
};

// Assistant
export const assistant = {
	chat: (messages, preferences = {}) =>
		request("/assistant/chat", {
			method: "POST",
			body: JSON.stringify({ messages, user_preferences: preferences }),
		}),
};

// Analytics
export const analytics = {
	global: () => request("/analytics/global"),
	enterprise: (id) => request(`/analytics/enterprise/${id}`),
};

// Admin
export const admin = {
	users: () => request("/admin/users"),
	updateUser: (id, data) =>
		request(`/admin/users/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		}),
	bookings: () => request("/admin/bookings"),
	updateBooking: (id, data) =>
		request(`/admin/bookings/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		}),
	createEnterprise: (data) =>
		request("/admin/enterprises", { method: "POST", body: JSON.stringify(data) }),
	updateEnterprise: (id, data) =>
		request(`/admin/enterprises/${id}`, { method: "PUT", body: JSON.stringify(data) }),
	deleteEnterprise: (id) =>
		request(`/admin/enterprises/${id}`, { method: "DELETE" }),
	tours: () => request("/admin/tours"),
	createTour: (data) =>
		request("/admin/tours", { method: "POST", body: JSON.stringify(data) }),
	updateTour: (id, data) =>
		request(`/admin/tours/${id}`, { method: "PUT", body: JSON.stringify(data) }),
	deleteTour: (id) =>
		request(`/admin/tours/${id}`, { method: "DELETE" }),
};

// Enterprise LK
export const enterpriseLK = {
	profile: () => request("/enterprise-lk/profile"),
	updateProfile: (data) =>
		request("/enterprise-lk/profile", {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	tours: () => request("/enterprise-lk/tours"),
	createTour: (data) =>
		request("/enterprise-lk/tours", {
			method: "POST",
			body: JSON.stringify(data),
		}),
	updateTour: (id, data) =>
		request(`/enterprise-lk/tours/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	deleteTour: (id) =>
		request(`/enterprise-lk/tours/${id}`, {
			method: "DELETE",
		}),
	analytics: () => request("/enterprise-lk/analytics"),
	adminAll: (params = {}) => {
		// Удаляем ключи с undefined/null/пустыми значениями
		const clean = Object.fromEntries(
			Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
		);
		const query = new URLSearchParams(clean).toString();
		return request(`/enterprise-lk/admin/all${query ? `?${query}` : ""}`);
	},
	updateStatus: (id, status) =>
		request(`/enterprise-lk/admin/${id}/status`, {
			method: "PATCH",
			body: JSON.stringify({ status }),
		}),
};

// Regions (CRUD for admin)
export const regions = {
	list: () => request("/regions"),
	get: (name) => request(`/regions/${encodeURIComponent(name)}`),
	create: (data) =>
		request("/regions", { method: "POST", body: JSON.stringify(data) }),
	update: (name, data) =>
		request(`/regions/${encodeURIComponent(name)}`, {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	delete: (name) =>
		request(`/regions/${encodeURIComponent(name)}`, { method: "DELETE" }),
};

// Settings
export const settings = {
	get: async () => {
		const data = await request("/settings");
		// Convert array [{key, value}] -> {key: value}
		const obj = {};
		if (Array.isArray(data.settings)) {
			for (const s of data.settings) {
				obj[s.key] = s.value;
			}
		}
		return { settings: obj };
	},
	update: (data) =>
		request("/settings", {
			method: "PUT",
			body: JSON.stringify(data),
		}),
	testVk: () => request("/settings/test-vk", { method: "POST" }),
	testAi: () => request("/settings/test-ai", { method: "POST" }),
};

export default {
	auth,
	enterprises,
	tours,
	bookings,
	places,
	assistant,
	analytics,
	admin,
	enterpriseLK,
	regions,
	settings,
};