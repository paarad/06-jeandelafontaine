export type PromptOptions = {
	characters: string;
	setting: string;
	theme: string;
	style: "Classic" | "Modern" | "Crypto";
	tone: "Whimsical" | "Darkly comic" | "Uplifting" | "Satirical";
	language: "English" | "Français";
};

export const SYSTEM_PROMPT = `You are a fable writer inspired by Jean de La Fontaine. Write concise, musical verses (10–20 lines) in the requested language, ending with a short moral (1–2 lines) prefixed with "Moral:". Keep it kid‑friendly and coherent. If "Crypto" style is chosen, use light, accessible satire.`;

export function buildUserPrompt(opts: PromptOptions): string {
	return [
		"Write a fable with:",
		`- Characters: ${sanitize(opts.characters)}`,
		`- Setting: ${sanitize(opts.setting)}`,
		`- Theme: ${sanitize(opts.theme)}`,
		`- Style: ${opts.style}`,
		`- Tone: ${opts.tone}`,
		`- Language: ${opts.language}`,
		"",
		"Constraints:",
		"- 10–20 lines total, then a single “Moral:” line.",
		"- Rhythmic, vivid, easy to read aloud.",
	].join("\n");
}

const urlRegex = /(https?:\/\/|www\.)\S+/gi;
const emailRegex = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/g;

export function sanitize(input: string): string {
	const trimmed = input.trim().slice(0, 200);
	return trimmed.replace(urlRegex, "").replace(emailRegex, "").trim();
}

export type FableResponse = {
	title: string;
	lines: string[];
	moral: string;
};

const moralRegex = /^(?:\u201c|\u201d|\u00ab|\u00bb)?\s*(?:Moral|Morale)\s*[\:\-\u2014]\s*/i;

export function parseFableResponse(text: string): FableResponse {
	// Try to split title, verses, and moral
	const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
	let title = "";
	let moral = "";
	const verses: string[] = [];

	for (const line of lines) {
		if (!title && line.length > 0 && line.length < 120 && /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸ]/.test(line)) {
			title = line;
			continue;
		}
		if (moralRegex.test(line)) {
			moral = line.replace(moralRegex, "Moral: ").trim();
			continue;
		}
		verses.push(line);
	}

	// If no explicit title, derive from first non-empty verse line
	if (!title && verses.length) {
		title = deriveTitle(verses[0]);
	}

	// Enforce constraints
	const verseLines = verses.filter(l => !moralRegex.test(l));
	const clamped = verseLines.slice(0, 20);
	return {
		title: title || "Untitled Fable",
		lines: clamped,
		moral: moral || "Moral: Every choice teaches a lesson.",
	};
}

function deriveTitle(firstLine: string): string {
	const words = firstLine.split(/\s+/).slice(0, 6).join(" ");
	return words.replace(/[.,;:!?]+$/, "");
} 