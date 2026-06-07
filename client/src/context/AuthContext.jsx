import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			auth
				.me()
				.then((data) => setUser(data.user))
				.catch(() => localStorage.removeItem("token"))
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
		}
	}, []);

	const login = async (email, password) => {
		try {
			const data = await auth.login({ email, password });
			localStorage.setItem("token", data.token);
			setUser(data.user);
			return { success: true, user: data.user };
		} catch (err) {
			return { success: false, error: err.message };
		}
	};

	const register = async (email, password, name) => {
		try {
			const data = await auth.register({ email, password, name });
			localStorage.setItem("token", data.token);
			setUser(data.user);
			return { success: true, user: data.user };
		} catch (err) {
			return { success: false, error: err.message };
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}

export default AuthContext;