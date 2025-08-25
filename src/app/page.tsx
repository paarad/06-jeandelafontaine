import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="min-h-screen container mx-auto px-4 py-16 grid gap-10">
			<section className="text-center space-y-6">
				<div className="playful-gradient bg-clip-text text-transparent">
					<h1 className="text-5xl font-bold mb-4">📚 jeandelafontaine AI 📚</h1>
				</div>
				<p className="text-xl text-muted-foreground">Create and read short AI‑generated fables in English or French.</p>
				<Link href="/create">
					<Button size="lg" className="playful-button text-lg px-8 py-4">
						🎭 Create a Fable 🎭
					</Button>
				</Link>
			</section>
			<section className="grid gap-3 max-w-2xl mx-auto">
				<h2 className="text-xl font-semibold text-center">✨ Example prompts ✨</h2>
				<div className="playful-card p-6">
					<ul className="list-disc pl-5 text-sm space-y-2">
						<li>Characters: a fox and a startup founder; Setting: a bustling market; Theme: greed vs patience; Style: Crypto; Tone: Satirical; Language: English</li>
						<li>Characters: une tortue et un robot; Setting: un parc; Theme: lenteur et sagesse; Style: Classic; Tone: Uplifting; Language: Français</li>
						<li>Characters: a bee and a painter; Setting: a sunny field; Theme: work and joy; Style: Modern; Tone: Whimsical; Language: English</li>
					</ul>
				</div>
			</section>
		</main>
	);
}
