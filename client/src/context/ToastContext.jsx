import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const addToast = useCallback((message, type = "info", duration = 4000) => {
		const id = ++toastId;
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, duration);
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = {
		success: (msg) => addToast(msg, "success"),
		error: (msg) => addToast(msg, "error", 6000),
		info: (msg) => addToast(msg, "info"),
		warning: (msg) => addToast(msg, "warning"),
	};

	return (
		<ToastContext.Provider value={toast}>
			{children}
			{/* Toast Container */}
			<div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-start gap-3 animate-slide-up ${
							t.type === "success"
								? "bg-green-600 text-white"
								: t.type === "error"
									? "bg-red-600 text-white"
									: t.type === "warning"
										? "bg-yellow-500 text-white"
										: "bg-gray-800 text-white"
						}`}
					>
						<span className="flex-shrink-0 mt-0.5">
							{t.type === "success" && "✅"}
							{t.type === "error" && "❌"}
							{t.type === "warning" && "⚠️"}
							{t.type === "info" && "ℹ️"}
						</span>
						<span className="flex-grow">{t.message}</span>
						<button
							onClick={() => removeToast(t.id)}
							className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100"
						>
							×
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	return useContext(ToastContext);
}

export default ToastContext;