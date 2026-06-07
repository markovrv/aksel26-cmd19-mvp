import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div className="min-h-[calc(100vh-73px)] flex items-center justify-center py-12 px-4">
			<div className="card p-12 text-center max-w-lg">
				<div className="text-8xl mb-6">🏭</div>
				<h1 className="text-4xl font-bold mb-4">404</h1>
				<h2 className="text-xl font-semibold mb-4">Страница не найдена</h2>
				<p className="text-gray-600 mb-8">
					Кажется, вы забрели не в тот цех. Такой страницы не существует или
					она была перемещена.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link to="/" className="btn-primary px-8">
						На главную
					</Link>
					<Link to="/catalog" className="btn-secondary px-8">
						В каталог
					</Link>
				</div>
			</div>
		</div>
	);
}