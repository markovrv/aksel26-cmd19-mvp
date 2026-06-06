import { Router } from "express";
import OpenAI from "openai";
import { dbAll, dbGet } from "../db/db.js";
import { llmLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Get tours data for LLM context
async function getToursForLLM() {
	const tours = await dbAll(`
    SELECT t.id, t.title, t.production_type, t.duration, t.cost, t.interactivity_level,
           t.physical_load, t.food_on_site, t.max_group_size, t.tags, e.region
    FROM tours t
    JOIN enterprises e ON t.enterprise_id = e.id
    WHERE t.status = 'published'
  `);

	return tours.map((t) => ({
		id: t.id,
		title: t.title,
		type: t.production_type,
		region: t.region,
		duration: t.duration,
		cost: t.cost,
		interactivity: t.interactivity_level,
		physical_load: t.physical_load,
		food: t.food_on_site === 1,
		capacity: t.max_group_size,
		tags: JSON.parse(t.tags || "[]"),
	}));
}

// Get LLM settings
async function getLLMSettings() {
	const settings = await dbAll(
		'SELECT key, value FROM settings WHERE key LIKE "llm_%"',
	);
	const settingsMap = {};
	settings.forEach((s) => (settingsMap[s.key] = s.value));
	return settingsMap;
}

// Chat with AI assistant
router.post("/chat", llmLimiter, async (req, res) => {
	try {
		const { messages, user_preferences = {} } = req.body;

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: "Сообщения обязательны" });
		}

		const settings = await getLLMSettings();

		// Check if LLM is configured
		if (!settings.llm_api_key || !settings.llm_base_url) {
			return res.json({
				response:
					"AI-ассистент временно недоступен. Пожалуйста, воспользуйтесь фильтрами в каталоге.",
				tours: [],
			});
		}

		// Build system prompt
		const toursData = await getToursForLLM();
		const systemPrompt = `${settings.llm_system_prompt_role || "Ты — умный помощник по подбору промышленных экскурсий."}

${settings.llm_system_prompt_instructions || "Отвечай кратко. Предлагай 3-5 экскурсий с кратким объяснением."}

Доступные экскурсии:
${JSON.stringify(toursData, null, 2)}

Формат ответа:
1. Краткий ответ пользователю
2. Массив ID рекомендованных экскурсий: [1, 3, 5]
`;

		const openai = new OpenAI({
			apiKey: settings.llm_api_key,
			baseURL: settings.llm_base_url,
		});

		const response = await openai.chat.completions.create({
			model: settings.llm_model || "gpt-4o-mini",
			messages: [{ role: "system", content: systemPrompt }, ...messages],
			temperature: parseFloat(settings.llm_temperature) || 0.7,
			max_tokens: parseInt(settings.llm_max_tokens) || 1000,
		});

		const content = response.choices[0]?.message?.content || "";

		// Try to extract tour IDs from response
		let recommendedTours = [];
		try {
			const idMatch = content.match(/\[\s*\d+\s*(,\s*\d+\s*)*\]/);
			if (idMatch) {
				recommendedTours = JSON.parse(idMatch[0]);
			}
		} catch (e) {
			// Ignore parsing errors
		}

		res.json({
			response: content,
			tours: recommendedTours,
		});
	} catch (err) {
		console.error("Assistant error:", err);
		res.status(500).json({
			response:
				"Произошла ошибка при обращении к AI-ассистенту. Попробуйте позже.",
			tours: [],
		});
	}
});

export default router;
