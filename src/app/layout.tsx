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
  title: "Straitly — The LLM Router for Serious Devs",
  description:
    "One endpoint, every model. 0% markup on tokens, 99.9% uptime, 0ms added latency. An OpenAI-compatible gateway to 300+ models.",
  openGraph: {
    title: "Straitly — The LLM Router for Serious Devs",
    description:
      "One endpoint, every model. 0% markup on tokens, 99.9% uptime, 0ms added latency. An OpenAI-compatible gateway to 300+ models.",
    url: "https://straitly.ai",
    siteName: "Straitly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Straitly — The LLM Router for Serious Devs",
    description:
      "One endpoint, every model. 0% markup, 99.9% uptime, 0ms added latency.",
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
      <body>{children}</body>
    </html>
  );
}
