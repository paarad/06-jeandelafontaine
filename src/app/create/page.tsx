"use client";

import { useEffect, useState } from "react";
import { FableForm } from "@/components/FableForm";
import { FableResult } from "@/components/FableResult";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { HistoryDrawer, type HistoryEntry } from "@/components/HistoryDrawer";
import type { FableResponse } from "@/lib/prompts";

export default function CreatePage() {
	const [result, setResult] = useState<(FableResponse & { language: "English" | "Français" }) | null>(null);
	const [loading, setLoading] = useState(false);
	const [lastInput, setLastInput] = useState<any>(null);

	useEffect(() => {
		const raw = localStorage.getItem("fable_last_input");
		if (raw) setLastInput(JSON.parse(raw));
	}, []);

	function handleResult(data: FableResponse & { language: "English" | "Français" }) {
		setResult(data);
		setLoading(false);
		const live = document.getElementById("aria-live");
		if (live) live.textContent = "Fable ready";
		// notify history components to refresh
		window.dispatchEvent(new CustomEvent("fable-history-updated"));
	}

	function handleRestore(entry: HistoryEntry) {
		setResult({ title: entry.title, lines: entry.lines, moral: entry.moral, language: entry.language });
	}

	async function handleRegenerate() {
		try {
			const raw = localStorage.getItem("fable_last_input");
			const input = raw ? JSON.parse(raw) : lastInput;
			if (!input) return;
			setLoading(true);
			setResult(null);
			const res = await fetch("/api/fable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
			const data = (await res.json()) as FableResponse;
			setResult({ ...data, language: input.language });
			window.dispatchEvent(new CustomEvent("fable-history-updated"));
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="container mx-auto px-4 py-8 grid gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Create</h1>
				<HistoryDrawer onRestore={handleRestore} />
			</div>
			<div className="grid gap-8 lg:grid-cols-2">
				<div className="flex justify-center">
					<div className="w-full max-w-lg">
						<FableForm onResult={(d) => {
							setLastInput((() => {
								const raw = localStorage.getItem("fable_history");
								// persist last input separately
								const lastRaw = localStorage.getItem("fable_last_input");
								return lastRaw ? JSON.parse(lastRaw) : null;
							})());
							handleResult(d);
						}} />
						<div id="aria-live" className="sr-only" aria-live="polite" />
					</div>
				</div>
				<div className="flex justify-center">
					<div className="w-full max-w-2xl">
						{loading && <LoadingSkeleton />}
						{result && (
							<FableResult
								data={result}
								language={result.language}
								onNew={() => setResult(null)}
								onRegenerate={handleRegenerate}
							/>
						)}
					</div>
				</div>
			</div>
		</main>
	);
} 