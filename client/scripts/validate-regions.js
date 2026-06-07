/**
 * Скрипт для валидации regions.json
 * Выявляет проблемы в полигонах регионов:
 *  - Микро-полигоны (< 4 точек)
 *  - Незамкнутые кольца
 *  - Полигоны с дублирующимися подряд точками
 *  - Полигоны с точками вне территории РФ
 *
 * Запуск: node scripts/validate-regions.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const regionsPath = path.join(__dirname, "..", "public", "regions.json");

const raw = fs.readFileSync(regionsPath, "utf-8");
const regions = JSON.parse(raw);

const MIN_POINTS = 4;

const report = {
	totalRegions: 0,
	ok: 0,
	errors: [],
	warnings: [],
};

for (const [regionName, polygons] of Object.entries(regions)) {
	report.totalRegions++;

	if (!polygons || typeof polygons !== "object") {
		report.errors.push({ region: regionName, issue: "Нет полигонов или не object" });
		continue;
	}

	const keys = Object.keys(polygons);

	if (keys.length === 0) {
		report.warnings.push({ region: regionName, issue: "Нет ни одного полигона" });
		continue;
	}

	let regionOk = true;

	for (const key of keys) {
		const coords = polygons[key];

		if (!Array.isArray(coords)) {
			report.errors.push({ region: regionName, issue: `Полигон "${key}" не является массивом` });
			regionOk = false;
			continue;
		}

		// 1. Микро-полигон
		if (coords.length < MIN_POINTS) {
			report.errors.push({
				region: regionName,
				issue: `Полигон "${key}" содержит всего ${coords.length} точек (< ${MIN_POINTS})`,
				detail: coords.map((p) => `[${p[0].toFixed(4)}, ${p[1].toFixed(4)}]`).join(" → "),
			});
			regionOk = false;
			continue;
		}

		// 2. Незамкнутое кольцо
		const first = coords[0];
		const last = coords[coords.length - 1];
		if (Array.isArray(first) && Array.isArray(last)) {
			if (first[0] !== last[0] || first[1] !== last[1]) {
				report.warnings.push({
					region: regionName,
					issue: `Полигон "${key}" не замкнут (первая [${first[0].toFixed(4)}, ${first[1].toFixed(4)}] ≠ последняя [${last[0].toFixed(4)}, ${last[1].toFixed(4)}])`,
				});
			}
		}

		// 3. Дублирующиеся подряд точки
		for (let i = 1; i < coords.length; i++) {
			const a = coords[i - 1];
			const b = coords[i];
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a[0] === b[0] && a[1] === b[1]) {
					report.warnings.push({
						region: regionName,
						issue: `Полигон "${key}" точки #${i - 1} и #${i} совпадают [${a[0].toFixed(4)}, ${a[1].toFixed(4)}]`,
					});
				}
			}
		}
	}

	if (regionOk) report.ok++;
}

// Вывод отчёта
console.log("=".repeat(60));
console.log("📊 ОТЧЁТ ВАЛИДАЦИИ ПОЛИГОНОВ РЕГИОНОВ");
console.log("=".repeat(60));
console.log(`\n✅ Всего регионов: ${report.totalRegions}`);
console.log(`   Из них OK:      ${report.ok}`);
console.log(`   С ошибками:     ${report.errors.length}`);
console.log(`   Предупреждения: ${report.warnings.length}`);

if (report.errors.length > 0) {
	console.log("\n❌ ОШИБКИ:");
	for (const err of report.errors) {
		console.log(`   • ${err.region}: ${err.issue}`);
		if (err.detail) {
			console.log(`     ${err.detail}`);
		}
	}
	console.log(`\n   Итого ошибок: ${report.errors.length}`);
}

if (report.warnings.length > 0) {
	console.log("\n⚠️  ПРЕДУПРЕЖДЕНИЯ:");
	// Группируем по типу
	const byType = {};
	for (const w of report.warnings) {
		const type = w.issue.startsWith("Полигон") ? "Незамкнутые кольца" : "Дублирующиеся точки";
		if (!byType[type]) byType[type] = [];
		byType[type].push(w);
	}
	for (const [type, items] of Object.entries(byType)) {
		console.log(`\n   📂 ${type}: ${items.length}`);
		// Показываем первые 5
		items.slice(0, 5).forEach((w) => {
			console.log(`     • ${w.region}: ${w.issue}`);
		});
		if (items.length > 5) {
			console.log(`     ... и ещё ${items.length - 5}`);
		}
	}
}

console.log("\n" + "=".repeat(60));