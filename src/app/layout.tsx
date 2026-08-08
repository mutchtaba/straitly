import type { Metadata } from "next";
import { Handjet, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const handjet = Handjet({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://straitly.ai"),
  title: "Straitly — A unified interface for LLMs",
  description:
    "One OpenAI-compatible API for Claude, GPT, and Gemini. Qualified teams get preferred pricing on frontier models.",
  openGraph: {
    title: "Straitly — A unified interface for LLMs",
    description:
      "One OpenAI-compatible API for Claude, GPT, and Gemini. Qualified teams get preferred pricing on frontier models.",
    url: "https://straitly.ai",
    siteName: "Straitly",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Retro terminal running a chat completion through the Straitly API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Straitly — A unified interface for LLMs",
    description:
      "One OpenAI-compatible API for Claude, GPT, and Gemini. Qualified teams get preferred pricing on frontier models.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${handjet.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/DepartureMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      {/* browser extensions inject attributes on <body> before React
          hydrates (e.g. cz-shortcut-listen) — never our bug, silence it */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
