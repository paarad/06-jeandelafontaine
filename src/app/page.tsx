import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="min-h-screen container mx-auto px-4 py-16 grid gap-10">
			<section className="text-center space-y-6">
				<h1 className="text-4xl font-bold">jeandelafontaine AI</h1>
				<p className="text-muted-foreground">Create and read short AI‑generated fables in English or French.</p>
				<Link href="/create"><Button size="lg">Create a Fable</Button></Link>
			</section>
		</main>
	);
}
