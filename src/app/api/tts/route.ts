import { NextRequest } from "next/server";
import { z } from "zod";
import { MODELS, openai } from "@/lib/openai";
import { createLimiter } from "@/lib/ratelimit";

const Schema = z.object({
	text: z.string().min(4).max(5000),
	voice: z.enum(["kid-en", "women"]).default("kid-en"),
	format: z.enum(["mp3", "opus"]).default("mp3"),
	speed: z.number().min(0.5).max(1.25).optional().default(0.98),
	pitch: z.number().min(-6).max(6).optional().default(0),
});

const limiter = createLimiter(20, 60 * 60); // 20 TTS/IP/hour

type OpenAiVoice = string; // use string until SDK exposes union types

export async function POST(req: NextRequest) {
	try {
		const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
		const ip = forwarded.split(",")[0]?.trim() || "anonymous";
		const { success, reset } = await limiter.limit(`tts:${ip}`);
		if (!success) {
			return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(reset) } });
		}

		const json = await req.json();
		const input = Schema.safeParse(json);
		if (!input.success) {
			return new Response(JSON.stringify({ error: "Invalid input", details: input.error.flatten() }), { status: 400, headers: { "Content-Type": "application/json" } });
		}
		const { text, voice, format, speed } = input.data;

		if (!process.env.OPENAI_API_KEY) {
			return new Response(JSON.stringify({ error: "Server misconfiguration: missing OPENAI_API_KEY" }), { status: 500, headers: { "Content-Type": "application/json" } });
		}

		if (format !== "mp3") {
			return new Response(JSON.stringify({ error: "Requested format not supported currently" }), { status: 400, headers: { "Content-Type": "application/json" } });
		}

		const voiceId: OpenAiVoice = voice === "women" ? "alloy" : "verse";

		const response = await openai.audio.speech.create({
			model: MODELS.TTS,
			voice: voiceId,
			input: text,
			speed,
		});

		const mime = "audio/mpeg";
		const buffer = Buffer.from(await response.arrayBuffer());
		return new Response(buffer, { status: 200, headers: { "Content-Type": mime, "Cache-Control": "no-store" } });
	} catch (err) {
		console.error("/api/tts error", err);
		return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
	}
} 