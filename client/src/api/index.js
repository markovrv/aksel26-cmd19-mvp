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
		const query = new URLSearchParams(params).toString();
		return request(`/places${query ? `?${query}` : ""}`);
	},
	types: () => request("/places/types"),
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
};

// Settings
export const settings = {
	get: () => request("/settings"),
	update: (data) =>
		request("/settings", {
			method: "PUT",
			body: JSON.stringify(data),
		}),
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
	settings,
};
