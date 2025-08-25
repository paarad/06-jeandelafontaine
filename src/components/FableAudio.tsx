"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Voice = "kid-en" | "women";

export function FableAudio({ text, language }: { text: string; language: "English" | "Français" }) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const defaultVoice: Voice = language === "Français" ? "women" : "kid-en";
	const [voice, setVoice] = useState<Voice>(() => {
		if (typeof window === "undefined") return defaultVoice;
		return (localStorage.getItem("fable_voice") as Voice) || defaultVoice;
	});
	const [loading, setLoading] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		localStorage.setItem("fable_voice", voice);
	}, [voice]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);
		const handleEnded = () => setIsPlaying(false);

		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);

		return () => {
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
		};
	}, []);

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

	function handlePause() {
		if (audioRef.current) {
			audioRef.current.pause();
		}
	}

	return (
		<div className="flex items-center gap-2">
			<Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
				<SelectTrigger className="w-[160px]"><SelectValue placeholder="Voice" /></SelectTrigger>
				<SelectContent>
					<SelectItem value="kid-en">Men Voice</SelectItem>
					<SelectItem value="women">Women Voice</SelectItem>
				</SelectContent>
			</Select>
			{!isPlaying ? (
				<Button onClick={handleListen} aria-label="Listen to this fable" disabled={loading}>
					{loading ? "Loading…" : "Listen"}
				</Button>
			) : (
				<Button onClick={handlePause} aria-label="Pause audio" variant="secondary">
					⏸️ Pause
				</Button>
			)}
			<audio ref={audioRef} hidden preload="auto" />
		</div>
	);
} 