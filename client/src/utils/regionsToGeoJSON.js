/**
 * Конвертирует regions.json (объект регионов с массивами координат)
 * в GeoJSON FeatureCollection для Yandex Maps
 */

export function convertRegionsToGeoJSON(regionsData) {
	if (!regionsData || typeof regionsData !== "object") return null;

	const features = [];

	for (const [regionName, polygons] of Object.entries(regionsData)) {
		if (!polygons || typeof polygons !== "object") continue;

		const polygonRings = [];

		for (const key of Object.keys(polygons)) {
			const coords = polygons[key];
			if (!Array.isArray(coords) || coords.length < 4) continue; // минимум 4 точки для замкнутого полигона

			// Convert [lat, lng] tuples to [lng, lat] for GeoJSON
			const ring = coords.map((point) => {
				if (Array.isArray(point) && point.length >= 2) {
					return [point[1], point[0]]; // GeoJSON uses [lng, lat]
				}
				return point;
			});

			// Ensure ring is closed (first point === last point)
			const first = ring[0];
			const last = ring[ring.length - 1];
			if (first[0] !== last[0] || first[1] !== last[1]) {
				ring.push([...first]);
			}

			polygonRings.push(ring);
		}

		if (polygonRings.length === 0) continue;

		// Create feature
		features.push({
			type: "Feature",
			properties: {
				name: regionName,
			},
			geometry:
				polygonRings.length === 1
					? {
							type: "Polygon",
							coordinates: polygonRings, // [[ring1]]
						}
					: {
							type: "MultiPolygon",
							// Каждое кольцо должно быть отдельным полигоном: [[[ring1]], [[ring2]]]
							coordinates: polygonRings.map((ring) => [ring]),
						},
		});
	}

	return {
		type: "FeatureCollection",
		features,
	};
}

/**
 * Получает центроид региона для размещения маркера
 */
export function getRegionCentroid(polygons) {
	if (!polygons || typeof polygons !== "object") return null;

	let latSum = 0,
		lngSum = 0,
		count = 0;

	for (const key of Object.keys(polygons)) {
		const coords = polygons[key];
		if (Array.isArray(coords)) {
			for (const point of coords) {
				if (Array.isArray(point) && point.length >= 2) {
					latSum += point[0];
					lngSum += point[1];
					count++;
				}
			}
		}
	}

	if (count === 0) return null;
	return [latSum / count, lngSum / count];
}