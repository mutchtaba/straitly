import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://straitly.ai"),
  title: "Straitly — Every model. Below list price.",
  description:
    "One API for 300+ models at 10–25% under provider list prices. We pool demand, buy in bulk, and pass the discount to you. Costco for tokens.",
  openGraph: {
    title: "Straitly — Every model. Below list price.",
    description:
      "One API for 300+ models at 10–25% under provider list prices. We pool demand, buy in bulk, and pass the discount to you.",
    url: "https://straitly.ai",
    siteName: "Straitly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Straitly — Every model. Below list price.",
    description:
      "One API for 300+ models, 10–25% under list price. We buy in bulk. You get the discount.",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jetbrains.variable}>
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
