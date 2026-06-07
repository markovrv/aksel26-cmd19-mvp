import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Header from "./components/UI/Header";
import Home from "./components/UI/Home";
import Login from "./components/UI/Login";
import Register from "./components/UI/Register";
import Catalog from "./components/Catalog/Catalog";
import Enterprise from "./components/Enterprise/Enterprise";
import Tour from "./components/Tour/Tour";
import MyBookings from "./components/UI/MyBookings";
import Compare from "./components/Compare/Compare";
import Assistant from "./components/Assistant/Assistant";
import EnterpriseLK from "./components/Enterprise_LK/EnterpriseLK";
import BookingSuccess from "./components/Tour/BookingSuccess";
import AdminDashboard from "./components/Admin/AdminDashboard";
import NotFound from "./components/NotFound";

function App() {
	return (
		<AuthProvider>
			<ToastProvider>
				<BrowserRouter>
					<div className="min-h-screen bg-bg-main flex flex-col">
						<Header />
						<main className="flex-1">
							<Suspense
								fallback={
									<div className="flex items-center justify-center min-h-[50vh]">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
									</div>
								}
							>
								<Routes>
									<Route path="/" element={<Home />} />
									<Route path="/login" element={<Login />} />
									<Route path="/register" element={<Register />} />
									<Route path="/catalog" element={<Catalog />} />
									<Route path="/enterprise/:id" element={<Enterprise />} />
									<Route path="/tour/:id" element={<Tour />} />
									<Route path="/bookings" element={<MyBookings />} />
									<Route path="/compare" element={<Compare />} />
									<Route path="/assistant" element={<Assistant />} />
									<Route path="/enterprise-lk" element={<EnterpriseLK />} />
									<Route path="/booking-success" element={<BookingSuccess />} />
									<Route path="/admin" element={<AdminDashboard />} />
									<Route path="*" element={<NotFound />} />
								</Routes>
							</Suspense>
						</main>
						<footer className="bg-gray-900 text-white py-8">
							<div className="container mx-auto px-4 text-center">
								<p>© 2026 ПромОриентир — Платформа промышленного туризма</p>
							</div>
						</footer>
					</div>
				</BrowserRouter>
			</ToastProvider>
		</AuthProvider>
	);
}

export { useAuth } from "./context/AuthContext";
export default App;