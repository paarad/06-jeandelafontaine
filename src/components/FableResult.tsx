"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FableAudio } from "./FableAudio";
import { toast } from "sonner";
import type { FableResponse } from "@/lib/prompts";
import { track } from "@vercel/analytics/react";

export function FableResult({ data, language, onNew, onRegenerate }: { data: FableResponse; language: "English" | "Français"; onNew: () => void; onRegenerate: () => void; }) {
	const fullText = `${data.title}\n${data.lines.join("\n")}\n${data.moral}`;

	async function handleCopy() {
		await navigator.clipboard.writeText(fullText);
		toast.success("Copied to clipboard");
		track("copy_clicked");
	}

	return (
		<Card className="playful-card">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="fable-title">{data.title}</CardTitle>
				<FableAudio text={fullText} language={language} />
			</CardHeader>
			<CardContent>
				<div className="prose dark:prose-invert max-w-none">
					<div className="fable-verse whitespace-pre-wrap leading-7">
						{data.lines.join("\n")}
					</div>
					<Separator className="my-4" />
					<div className="fable-moral">{data.moral}</div>
				</div>
			</CardContent>
			<CardFooter className="flex gap-2 justify-end">
				<Button variant="secondary" onClick={onRegenerate} className="playful-button">🔄 Regenerate</Button>
				<Button variant="secondary" onClick={handleCopy} className="playful-button">📋 Copy</Button>
				<Button onClick={onNew} className="playful-button">✨ New</Button>
			</CardFooter>
		</Card>
	);
} 