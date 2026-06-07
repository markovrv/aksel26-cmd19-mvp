import React, { useEffect, useState, useRef } from "react";
import { enterprises, regions as regionsApi } from "../../api";
import { convertRegionsToGeoJSON, getRegionCentroid } from "../../utils/regionsToGeoJSON";

const YANDEX_API_KEY = "47e70ac9-78de-4c21-9fba-ffd8e5855ee6";

const PRODUCTION_ICONS = {
	"Строительное": "🏗️",
	"Пищевое": "🍬",
	"Машиностроение": "⚙️",
	"Лёгкая промышленность": "🧵",
	"IT-производство": "💻",
};

const PRODUCTION_COLORS = {
	"Строительное": "#E05A00",
	"Пищевое": "#22C55E",
	"Машиностроение": "#EF4444",
	"IT-производство": "#8B5CF6",
	"Лёгкая промышленность": "#F59E0B",
};

// Загрузка API Яндекс.Карт скриптом
function loadYandexMapsAPI() {
	return new Promise((resolve, reject) => {
		if (window.ymaps) {
			resolve(window.ymaps);
			return;
		}
		const script = document.createElement("script");
		script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU&coordorder=latlong&load=package.full&onload=__ymapsInit`;
		script.async = true;
		script.onerror = reject;

		window.__ymapsInit = () => {
			window.ymaps.ready(() => resolve(window.ymaps));
		};

		document.head.appendChild(script);
	});
}

export default function RussiaMap({ selectedRegion, onRegionSelect, onEnterpriseSelect, panelWidth = 0 }) {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const ymapsRef = useRef(null);
	const geoObjectsRef = useRef([]);
	const [enterpriseList, setEnterpriseList] = useState([]);
	const [geoJSON, setGeoJSON] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [regionVideoMap, setRegionVideoMap] = useState({});
	const regionCoordMapRef = useRef({});

	// Загружаем данные предприятий и границы регионов
	useEffect(() => {
		async function loadData() {
			try {
				const [entData, regionsResp, regionsDbData] = await Promise.all([
					enterprises.list({ status: "published" }),
					fetch("/regions.json"),
					regionsApi.list().catch(() => ({ regions: [] })),
				]);
				const regionsData = await regionsResp.json();
				const converted = convertRegionsToGeoJSON(regionsData);
				setEnterpriseList(entData.enterprises || []);
				setGeoJSON(converted);

				// Build region video info map from DB
				const videoMap = {};
				const dbRegions = regionsDbData.regions || [];
				for (const r of dbRegions) {
					videoMap[r.name] = {
						video: r.video_url || "",
						title: r.title || r.name,
						description: r.description || "",
					};
				}
				setRegionVideoMap(videoMap);

				// Build coords map
				const coordMap = {};
				for (const r of dbRegions) {
					if (r.coords) {
						try { coordMap[r.name] = JSON.parse(r.coords); } catch (e) {}
					}
				}
				regionCoordMapRef.current = coordMap;
			} catch (err) {
				console.error("Map load error:", err);
				setError("Ошибка загрузки данных");
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	// Инициализация карты
	useEffect(() => {
		if (loading || !containerRef.current) return;

		let ymapsInstance = null;

		loadYandexMapsAPI()
			.then((ymaps) => {
				ymapsInstance = ymaps;

				const map = new ymaps.Map(containerRef.current, {
					center: [64, 80],
					zoom: 3.5,
					controls: ["zoomControl", "fullscreenControl"],
					type: "yandex#map",
				});

				map.options.set({
					copyrightLogoVisible: false,
					copyrightProvidersVisible: false,
					yandexMapDisablePoiInteractivity: true,
				});

				mapRef.current = map;

				// Рисуем полигоны регионов
				if (geoJSON) {
					geoJSON.features.forEach((feature) => {
						const regionName = feature.properties.name;
						const geometryType = feature.geometry.type;
						const coords = feature.geometry.coordinates;
						const isSelected = regionName === selectedRegion;

						try {
							// Polygon: coords = [[ring1], [ring2], ...]
							// MultiPolygon: coords = [[[ring1]], [[ring2]], ...]
							const rings = geometryType === "MultiPolygon" ? coords.map((p) => p[0]) : coords;

							rings.forEach((ring) => {
								// Swap [lng, lat] -> [lat, lng] для Yandex Maps
								const polygonCoords = ring.map((point) => [point[1], point[0]]);

								const polygon = new ymaps.Polygon([polygonCoords], {
									name: regionName,
									hintContent: regionName,
								}, {
									fillColor: isSelected ? "rgba(224, 90, 0, 0.3)" : "rgba(46, 95, 163, 0.08)",
									strokeColor: isSelected ? "#E05A00" : "#2E5FA3",
									strokeWidth: isSelected ? 3 : 1.2,
									strokeOpacity: isSelected ? 1 : 0.6,
									cursor: "pointer",
								});

								polygon.events.add("click", () => {
									if (onRegionSelect) onRegionSelect(regionName);
								});

								map.geoObjects.add(polygon);
								geoObjectsRef.current.push(polygon);
							});
						} catch (e) {
							console.warn("Could not draw region:", regionName, e.message);
						}
					});
				}

				// Добавляем метки предприятий через кластеризатор
				const filteredEnterprises = selectedRegion
					? enterpriseList.filter((e) => e.region === selectedRegion)
					: enterpriseList;

				const placemarks = [];

				filteredEnterprises.forEach((enterprise) => {
					// Определяем координаты: сначала enterprise.coords, иначе центроид региона
					let latLng = null;
					if (enterprise.coords) {
						const parts = enterprise.coords.split(",").map(s => parseFloat(s.trim()));
						if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
							latLng = parts;
						}
					}
					if (!latLng) {
						latLng = regionCoordMapRef.current[enterprise.region];
					}
					if (!latLng) return;

					try {
						const placemark = new ymaps.Placemark(latLng, {
							hintContent: enterprise.name,
							balloonContentHeader: `<div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:bold">
								${PRODUCTION_ICONS[enterprise.production_type] || "🏭"} ${enterprise.name}
							</div>`,
							balloonContentBody: `<div style="font-size:12px;color:#666">
								${enterprise.production_type} • ${enterprise.region}<br/>
								${enterprise.description?.slice(0, 150) || ""}...
							</div>`,
							balloonContentFooter: `<a href="/enterprise/${enterprise.id}" style="display:inline-block;background:#E05A00;color:white;padding:4px 12px;border-radius:6px;text-decoration:none;font-size:12px;">Подробнее</a>`,
						}, {
							iconColor: PRODUCTION_COLORS[enterprise.production_type] || "#3B82F6",
							preset: "islands#circleDotIcon",
							hasBalloon: true,
							hideIconOnBalloonOpen: false,
						});

						placemark.events.add("click", () => {
							if (onEnterpriseSelect) onEnterpriseSelect(enterprise.id);
						});

						placemarks.push(placemark);
						geoObjectsRef.current.push(placemark);
					} catch (e) {
						// ignore
					}
				});

				// Создаём кластеризатор и добавляем метки
				if (placemarks.length > 0) {
					// Кастомная иконка кластера — оранжевый круг с числом
					const clusterIcon = ymaps.templateLayoutFactory.createClass(
						'<div style="display:flex;align-items:center;justify-content:center;' +
						'width:44px;height:44px;border-radius:50%;background:#E05A00;' +
						'border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);' +
						'color:#fff;font-size:14px;font-weight:700;cursor:pointer;' +
						'transition:transform 0.15s;">' +
						'{{ properties.geoObjects.length }}' +
						'</div>'
					);

					const clusterer = new ymaps.Clusterer({
						clusterIcons: [{
							shape: { type: "Circle", coordinates: [0, 0], radius: 22 },
						}],
						clusterIconLayout: clusterIcon,
						clusterBalloonContentLayout: "cluster#balloonCarousel",
						clusterBalloonItemContentLayout: ymaps.templateLayoutFactory.createClass(
							'<div style="padding:8px 12px;font-size:13px;max-width:220px;">' +
							'<div style="font-weight:600;margin-bottom:4px;">{{ properties.hintContent }}</div>' +
							'<div style="color:#888;">{{ properties.balloonContentBody }}</div>' +
							'</div>'
						),
						clusterBalloonPagerSize: 5,
						clusterDisableClickZoom: true,
						zoomMargin: 20,
						maxZoom: 12,
						gridSize: 32,
						hasBalloon: true,
					});
					clusterer.add(placemarks);
					map.geoObjects.add(clusterer);
					geoObjectsRef.current.push(clusterer);
				}
			})
			.catch((err) => {
				console.error("Yandex Maps load error:", err);
				setError("Ошибка загрузки Яндекс.Карт. Попробуйте обновить страницу.");
			});

		return () => {
			if (mapRef.current) {
				mapRef.current.destroy();
				mapRef.current = null;
			}
			geoObjectsRef.current = [];
		};
	}, [loading]);

	// Обновляем подсветку + приближение региона при изменении selectedRegion
	useEffect(() => {
		if (!mapRef.current || !geoJSON) return;
		const ymaps = window.ymaps;
		if (!ymaps) return;

		// Обновляем стили полигонов
		geoObjectsRef.current.forEach((obj) => {
			if (obj && obj.geometry && obj.geometry.getType() === "Polygon") {
				const regionName = obj.properties.get("name");
				const isSelected = regionName === selectedRegion;
				obj.options.set({
					fillColor: isSelected ? "rgba(224, 90, 0, 0.3)" : "rgba(46, 95, 163, 0.08)",
					strokeColor: isSelected ? "#E05A00" : "#2E5FA3",
					strokeWidth: isSelected ? 3 : 1.2,
				});
			}
		});

		if (!selectedRegion) {
			// Возвращаем карту к обзору всей России
			mapRef.current.setCenter([64, 80], 3.5, { duration: 400 });
			console.log("  🗺️ returning to all Russia view");
			return;
		}

		// Приближаем карту к выбранному региону со смещением bounds под панель
		if (selectedRegion && geoJSON) {
			const feature = geoJSON.features.find((f) => f.properties.name === selectedRegion);
			if (feature) {
				const coords = feature.geometry.coordinates;
				const allPoints = [];
				const processRing = (ring) => {
					ring.forEach((pt) => {
						if (typeof pt[0] === "number") {
							allPoints.push([pt[1], pt[0]]);
						} else {
							pt.forEach((subRing) => processRing(subRing));
						}
					});
				};
				if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
					if (typeof coords[0][0][0] === "number") {
						coords.forEach((ring) => processRing(ring));
					} else {
						coords.forEach((poly) => poly.forEach((ring) => processRing(ring)));
					}
				}
				if (allPoints.length > 0) {
					try {
						const bounds = ymaps.util.bounds.fromPoints(allPoints);
						
						// Расширяем bounds вправо, чтобы сместить карту левее
						if (panelWidth > 0 && containerRef.current) {
							const cw = containerRef.current.offsetWidth;
							const ew = cw - panelWidth; // эффективная ширина карты
							if (ew > 0) {
								const lngSpan = bounds[1][0] - bounds[0][0];
								const extraLng = lngSpan * (panelWidth / ew);
								bounds[1][0] += extraLng * 0.5;
								console.log(`  📐 bounds shifted: cw=${cw} ew=${ew} extra=${extraLng.toFixed(4)}°`);
							}
						}

						mapRef.current.setBounds(bounds, {
							checkZoomRange: true,
							zoomMargin: 20,
							duration: 400,
						});
					} catch (e) {
						console.warn("Bounds error:", e.message);
					}
				}
			}
		}
	}, [selectedRegion, geoJSON, panelWidth]);

	const handleMapClick = (regionName) => {
		onRegionSelect(regionName === selectedRegion ? null : regionName);
	};

	const filteredEnterprises = selectedRegion
		? enterpriseList.filter((e) => e.region === selectedRegion)
		: enterpriseList;

	const selectedVideo = selectedRegion ? regionVideoMap[selectedRegion] : null;

	return (
		<div className="relative">
			{loading ? (
				<div className="w-full h-[500px] rounded-xl bg-gray-100 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-orange mx-auto mb-4"></div>
						<p className="text-gray-500">Загрузка карты...</p>
					</div>
				</div>
			) : error ? (
				<div className="w-full h-[500px] rounded-xl bg-gray-100 flex items-center justify-center">
					<div className="text-center">
						<div className="text-4xl mb-4">🗺️</div>
						<p className="text-red-500">{error}</p>
					</div>
				</div>
			) : (
		<div
			ref={containerRef}
			className="w-full h-[600px] rounded-xl"
		></div>
			)}

			{/* Enterprise count */}
			<div className="absolute bottom-4 right-4 z-[1000]">
				<div className="card px-4 py-2 shadow-lg text-sm bg-white/95 backdrop-blur">
					{filteredEnterprises.length} предприятий
					{selectedRegion && ` в ${selectedRegion}`}
				</div>
			</div>
		</div>
	);
}