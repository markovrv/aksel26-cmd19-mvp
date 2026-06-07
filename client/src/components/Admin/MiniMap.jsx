import React, { useEffect, useRef } from "react";

const YANDEX_API_KEY = "47e70ac9-78de-4c21-9fba-ffd8e5855ee6";

function loadYandexMapsAPI() {
	return new Promise((resolve, reject) => {
		if (window.ymaps) {
			resolve(window.ymaps);
			return;
		}
		const script = document.createElement("script");
		script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU&coordorder=latlong&load=package.full&onload=__mmInit`;
		script.async = true;
		script.onerror = reject;

		window.__mmInit = () => {
			window.ymaps.ready(() => resolve(window.ymaps));
		};

		document.head.appendChild(script);
	});
}

export default function MiniMap({ coords, onCoordsChange }) {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const placemarkRef = useRef(null);
	const ymapsRef = useRef(null);

	// Парсим координаты
	let lat = null, lng = null;
	if (coords && /^\s*[\d.]+,\s*[\d.]+/.test(coords)) {
		const parts = coords.split(",").map(s => parseFloat(s.trim()));
		if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
			lat = parts[0];
			lng = parts[1];
		}
	}

	useEffect(() => {
		if (!containerRef.current) return;
		let destroyed = false;

		loadYandexMapsAPI().then((ymaps) => {
			if (destroyed) return;
			ymapsRef.current = ymaps;

			const center = lat !== null && lng !== null ? [lat, lng] : [58.6, 49.65];

			const map = new ymaps.Map(containerRef.current, {
				center,
				zoom: 10,
				controls: ["zoomControl"],
			});

			map.options.set({
				copyrightLogoVisible: false,
				copyrightProvidersVisible: false,
				yandexMapDisablePoiInteractivity: true,
			});

			mapRef.current = map;

			// Placemark
			const placemark = new ymaps.Placemark(center, {}, {
				iconColor: "#E05A00",
				preset: "islands#redCircleDotIcon",
				draggable: true,
			});

			placemark.events.add("dragend", () => {
				const pos = placemark.geometry.getCoordinates();
				const val = `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`;
				if (onCoordsChange) onCoordsChange(val);
			});

			placemarkRef.current = placemark;
			map.geoObjects.add(placemark);

			// Click on map to move placemark
			map.events.add("click", (e) => {
				const pos = e.get("coords");
				placemark.geometry.setCoordinates(pos);
				const val = `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`;
				if (onCoordsChange) onCoordsChange(val);
			});
		}).catch((err) => {
			console.error("MiniMap load error:", err);
		});

		return () => {
			destroyed = true;
			if (mapRef.current) {
				mapRef.current.destroy();
				mapRef.current = null;
			}
		};
	}, []);

	// Обновляем позицию маркера при изменении coords извне
	useEffect(() => {
		if (!mapRef.current || !ymapsRef.current || lat === null || lng === null) return;
		const newCenter = [lat, lng];
		mapRef.current.setCenter(newCenter, 10, { duration: 300 });
		if (placemarkRef.current) {
			placemarkRef.current.geometry.setCoordinates(newCenter);
		}
	}, [coords]);

	return (
		<div ref={containerRef} className="w-full h-48 rounded-lg border overflow-hidden"></div>
	);
}