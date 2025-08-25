"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { FableResponse } from "@/lib/prompts";
import { track } from "@vercel/analytics/react";

const FormSchema = z.object({
	characters: z.string().min(2),
	setting: z.string().optional().default(""),
	theme: z.string().min(2),
	style: z.enum(["Classic", "Modern", "Crypto"]).default("Classic"),
	tone: z.enum(["Whimsical", "Darkly comic", "Uplifting", "Satirical"]).default("Uplifting"),
	language: z.enum(["English", "Français"]).default("English"),
});

export type FableFormValues = z.infer<typeof FormSchema>;

type HistoryEntry = FableResponse & { language: "English" | "Français"; createdAt: number; input: FableFormValues };

export function FableForm({ onResult }: { onResult: (data: FableResponse & { language: "English" | "Français" }) => void }) {
	const [values, setValues] = useState<FableFormValues>({ characters: "", setting: "", theme: "", style: "Classic", tone: "Uplifting", language: "English" });
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const lang = navigator.language?.toLowerCase().includes("fr") ? "Français" : "English";
		setValues(v => ({ ...v, language: v.language || (lang as "English" | "Français") }));
	}, []);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const parsed = FormSchema.safeParse(values);
		if (!parsed.success) {
			toast.error("Please fill required fields (characters, theme).");
			return;
		}
		try {
			setLoading(true);
			track("generate_clicked");
			// persist last input for Regenerate
			localStorage.setItem("fable_last_input", JSON.stringify(parsed.data));
			const res = await fetch("/api/fable", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
			if (!res.ok) {
				const msg = await res.json().catch(() => ({ error: "Request failed" as string }));
				throw new Error((msg as { error?: string }).error || "Generation failed");
			}
			const data = (await res.json()) as FableResponse;
			track("generate_success");
			onResult({ ...data, language: parsed.data.language });
			// save to localStorage history
			const entry: HistoryEntry = { ...data, language: parsed.data.language, createdAt: Date.now(), input: parsed.data };
			const existingRaw = localStorage.getItem("fable_history");
			const existing: HistoryEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
			const next = [entry, ...existing].slice(0, 5);
			localStorage.setItem("fable_history", JSON.stringify(next));
			// notify listeners to refresh
			window.dispatchEvent(new CustomEvent("fable-history-updated"));
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to generate fable";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="playful-card">
			<CardHeader>
				<CardTitle className="fable-title">✨ Create a Fable ✨</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<Input 
						className="playful-input" 
						placeholder="Characters (required)" 
						value={values.characters} 
						onChange={(e) => setValues(v => ({ ...v, characters: e.target.value }))} 
					/>
					<Input 
						className="playful-input" 
						placeholder="Setting (optional)" 
						value={values.setting} 
						onChange={(e) => setValues(v => ({ ...v, setting: e.target.value }))} 
					/>
					<Textarea 
						className="playful-input" 
						placeholder="Theme (required)" 
						value={values.theme} 
						onChange={(e) => setValues(v => ({ ...v, theme: e.target.value }))} 
					/>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<Select value={values.style} onValueChange={(v) => setValues(val => ({ ...val, style: v as FableFormValues["style"] }))}>
							<SelectTrigger className="playful-input"><SelectValue placeholder="Style" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="Classic">Classic</SelectItem>
								<SelectItem value="Modern">Modern</SelectItem>
								<SelectItem value="Crypto">Crypto</SelectItem>
							</SelectContent>
						</Select>
						<Select value={values.tone} onValueChange={(v) => setValues(val => ({ ...val, tone: v as FableFormValues["tone"] }))}>
							<SelectTrigger className="playful-input"><SelectValue placeholder="Tone" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="Whimsical">Whimsical</SelectItem>
								<SelectItem value="Darkly comic">Darkly comic</SelectItem>
								<SelectItem value="Uplifting">Uplifting</SelectItem>
								<SelectItem value="Satirical">Satirical</SelectItem>
							</SelectContent>
						</Select>
						<Select value={values.language} onValueChange={(v) => setValues(val => ({ ...val, language: v as FableFormValues["language"] }))}>
							<SelectTrigger className="playful-input"><SelectValue placeholder="Language" /></SelectTrigger>
							<SelectContent>
								<SelectItem value="English">English</SelectItem>
								<SelectItem value="Français">Français</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button type="submit" disabled={loading} className="playful-button w-full">
						{loading ? "✨ Generating… ✨" : "🎭 Generate Fable 🎭"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
} 