import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
	return (
		<main className="min-h-screen container mx-auto px-4 py-16 grid gap-10">
			<section className="text-center space-y-6">
				<h1 className="text-4xl font-bold">jeandelafontaine AI</h1>
				<p className="text-muted-foreground">Create and read short AI‑generated fables in English or French.</p>
				<Link href="/create"><Button size="lg">Create a Fable</Button></Link>
			</section>
			<section className="grid gap-3 max-w-2xl mx-auto">
				<h2 className="text-xl font-semibold">Example prompts</h2>
				<ul className="list-disc pl-5 text-sm space-y-2">
					<li>Characters: a fox and a startup founder; Setting: a bustling market; Theme: greed vs patience; Style: Crypto; Tone: Satirical; Language: English</li>
					<li>Characters: une tortue et un robot; Setting: un parc; Theme: lenteur et sagesse; Style: Classic; Tone: Uplifting; Language: Français</li>
					<li>Characters: a bee and a painter; Setting: a sunny field; Theme: work and joy; Style: Modern; Tone: Whimsical; Language: English</li>
				</ul>
			</section>
		</main>
	);
} 