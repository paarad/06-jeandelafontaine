"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Voice = "kid-en" | "kid-fr";

export function FableAudio({ text, language }: { text: string; language: "English" | "Français" }) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const defaultVoice: Voice = language === "Français" ? "kid-fr" : "kid-en";
	const [voice, setVoice] = useState<Voice>(() => {
		if (typeof window === "undefined") return defaultVoice;
		return (localStorage.getItem("fable_voice") as Voice) || defaultVoice;
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		localStorage.setItem("fable_voice", voice);
	}, [voice]);

	async function handleListen() {
		try {
			setLoading(true);
			const res = await fetch("/api/tts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text, voice, format: "mp3" }),
			});
			if (!res.ok) throw new Error("TTS failed");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			if (audioRef.current) {
				audioRef.current.src = url;
				audioRef.current.play();
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
				<SelectTrigger className="w-[140px]"><SelectValue placeholder="Voice" /></SelectTrigger>
				<SelectContent>
					<SelectItem value="kid-en">Kid EN</SelectItem>
					<SelectItem value="kid-fr">Kid FR</SelectItem>
				</SelectContent>
			</Select>
			<Button onClick={handleListen} aria-label="Listen to this fable" disabled={loading}>
				{loading ? "Loading…" : "Listen"}
			</Button>
			<audio ref={audioRef} hidden preload="auto" />
		</div>
	);
} 