import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MODELS, openai } from "@/lib/openai";
import { SYSTEM_PROMPT, buildUserPrompt, parseFableResponse } from "@/lib/prompts";
import { createLimiter } from "@/lib/ratelimit";

const Schema = z.object({
	characters: z.string().min(2).max(200),
	setting: z.string().max(200).optional().default(""),
	theme: z.string().min(2).max(200),
	style: z.enum(["Classic", "Modern", "Crypto"]).default("Classic"),
	tone: z.enum(["Whimsical", "Darkly comic", "Uplifting", "Satirical"]).default("Uplifting"),
	language: z.enum(["English", "Français"]).default("English"),
});

const limiter = createLimiter(10, 60 * 60); // 10 generations/IP/hour

export async function POST(req: NextRequest) {
	try {
		const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
		const ip = forwarded.split(",")[0]?.trim() || "anonymous";
		const { success, reset } = await limiter.limit(`fable:${ip}`);
		if (!success) {
			return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429, headers: { "Retry-After": String(reset) } });
		}

		const json = await req.json();
		const input = Schema.safeParse(json);
		if (!input.success) {
			return NextResponse.json({ error: "Invalid input", details: input.error.flatten() }, { status: 400 });
		}
		const data = input.data;

		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json({ error: "Server misconfiguration: missing OPENAI_API_KEY" }, { status: 500 });
		}

		const system = SYSTEM_PROMPT;
		const user = buildUserPrompt(data);

		const completion = await openai.chat.completions.create({
			model: MODELS.TEXT,
			messages: [
				{ role: "system", content: system },
				{ role: "user", content: user },
			],
			temperature: 0.8,
			max_tokens: 400,
		});

		const content = completion.choices[0]?.message?.content || "";
		const parsed = parseFableResponse(content);
		return NextResponse.json(parsed, { status: 200 });
	} catch (err) {
		console.error("/api/fable error", err);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
} 