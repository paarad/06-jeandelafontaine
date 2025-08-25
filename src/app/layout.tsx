import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AI Fables";

export const metadata: Metadata = {
	title: APP_NAME,
	description: "Create and read short AI‑generated fables.",
	icons: {
		icon: [
			{
				url: "/favicon.ico",
				sizes: "any",
			},
		],
		apple: [
			{
				url: "/favicon.ico",
				sizes: "any",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="apple-touch-icon" href="/favicon.ico" />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{children}
				<Toaster richColors />
				<Analytics />
			</body>
		</html>
	);
}
