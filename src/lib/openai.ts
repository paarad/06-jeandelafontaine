import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
	// Do not throw in dev server startup to allow building without env; API routes will guard at runtime
	console.warn("[openai] Missing OPENAI_API_KEY. API routes depending on OpenAI will fail at runtime.");
}

export const openai = new OpenAI({ apiKey });

export const MODELS = {
	TEXT: "gpt-4o-mini",
	TTS: "gpt-4o-mini-tts",
} as const; 