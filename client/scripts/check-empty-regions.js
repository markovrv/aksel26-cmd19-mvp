/**
 * Скрипт проверяет регионы, у которых ВСЕ полигоны — микро-полигоны (< 4 точек)
 * После фильтрации они полностью исчезают с карты.
 *
 * Запуск: node scripts/check-empty-regions.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const regionsPath = path.join(__dirname, "..", "public", "regions.json");

const raw = fs.readFileSync(regionsPath, "utf-8");
const regions = JSON.parse(raw);

const MIN_POINTS = 4;

console.log("=".repeat(60));
console.log("РЕГИОНЫ, ИСЧЕЗАЮЩИЕ ПОСЛЕ ФИЛЬТРАЦИИ МИКРО-ПОЛИГОНОВ");
console.log("=".repeat(60));

let count = 0;

for (const [regionName, polygons] of Object.entries(regions)) {
	const keys = Object.keys(polygons);
	const totalPolygons = keys.length;
	const validPolygons = keys.filter((k) => polygons[k].length >= MIN_POINTS).length;
	const microPolygons = totalPolygons - validPolygons;

	if (validPolygons === 0) {
		console.log(`\n❌ ${regionName}: ${totalPolygons} полигонов, ВСЕ микро (${microPolygons}) — регион не отобразится!`);
		count++;
	} else if (microPolygons > 0) {
		console.log(`⚠️  ${regionName}: ${totalPolygons} полигонов, ${microPolygons} микро, ${validPolygons} норм — отобразится частично`);
	}
}

console.log(`\n\nИТОГО: ${count} регионов полностью исчезнут с карты`);

// Детальный анализ проблемных
console.log("\n" + "=".repeat(60));
console.log("ДЕТАЛЬНО по проблемным регионам (все полигоны < 4 точек):\n");

for (const [regionName, polygons] of Object.entries(regions)) {
	const keys = Object.keys(polygons);
	const valid = keys.filter((k) => polygons[k].length >= MIN_POINTS);
	if (valid.length === 0) {
		console.log(`📌 ${regionName}:`);
		for (const k of keys) {
			const coords = polygons[k];
			console.log(`   полигон "${k}": ${coords.length} точек`);
		}
	}
}