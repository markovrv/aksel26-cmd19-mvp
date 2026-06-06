import rateLimit from "express-rate-limit";

// General API rate limit
export const apiLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 100, // 100 requests per minute
	message: { error: "Слишком много запросов, попробуйте позже" },
});

// Stricter limit for LLM requests
export const llmLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // 10 LLM requests per minute
	message: {
		error: "Слишком много запросов к AI-ассистенту, попробуйте позже",
	},
});

export default { apiLimiter, llmLimiter };
