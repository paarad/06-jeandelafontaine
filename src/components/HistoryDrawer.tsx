"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { FableResponse } from "@/lib/prompts";

export type HistoryEntry = {
	createdAt: number;
	language: "English" | "Français";
	input: {
		characters: string;
		setting?: string;
		theme: string;
		style: "Classic" | "Modern" | "Crypto";
		tone: "Whimsical" | "Darkly comic" | "Uplifting" | "Satirical";
		language: "English" | "Français";
	};
} & FableResponse;

export function HistoryDrawer({ onRestore }: { onRestore: (entry: HistoryEntry) => void }) {
	const [items, setItems] = useState<HistoryEntry[]>([]);

	function load() {
		try {
			const raw = localStorage.getItem("fable_history");
			const arr: HistoryEntry[] = raw ? JSON.parse(raw) : [];
			setItems(arr);
		} catch {}
	}

	useEffect(() => {
		load();
		function onUpdate() { load(); }
		window.addEventListener("fable-history-updated", onUpdate as EventListener);
		return () => window.removeEventListener("fable-history-updated", onUpdate as EventListener);
	}, []);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">History</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Recent Fables</SheetTitle>
				</SheetHeader>
				<div className="mt-4 grid gap-3">
					{items.length === 0 && <div className="text-sm text-muted-foreground">No history yet.</div>}
					{items.map((it, idx) => (
						<button key={idx} className="text-left p-2 rounded-md hover:bg-accent" onClick={() => onRestore(it)}>
							<div className="font-medium line-clamp-1">{it.title}</div>
							<div className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString()} • {it.language}</div>
						</button>
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
} 