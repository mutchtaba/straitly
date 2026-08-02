"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

const ROWS = [
  {
    icon: "/retro/icon-hacker-cut.png",
    title: "Indie hackers qualify",
    sub: "Shipping solo? You qualify.",
  },
  {
    icon: "/retro/icon-rocket-cut.png",
    title: "Small startups qualify",
    sub: "Pre-seed to Series A? You qualify.",
  },
  {
    icon: "/retro/icon-terminals-cut.png",
    title: "Software engineering teams qualify",
    sub: "Burning budget on inference? You qualify.",
  },
] as const;

/* Coins drop into the machine's dispenser bin when the section scrolls
   into view, then idle-hop forever. They live inside an overflow-hidden
   div that exactly matches the bin's dark opening, so a falling coin can
   only ever be visible inside the bin — never over the machine's face. */
const COINS = [
  { src: "/retro/coin-openai-cut.png", left: "-2%", rot: -8 },
  { src: "/retro/coin-meta-cut.png", left: "19%", rot: 6 },
  { src: "/retro/coin-ai-cut.png", left: "40%", rot: -5 },
  { src: "/retro/coin-gemini-cut.png", left: "61%", rot: 9 },
] as const;

function BinCoin({
  src,
  left,
  rot,
  index,
}: {
  src: string;
  left: string;
  rot: number;
  index: number;
}) {
  const drop = 0.45 + index * 0.3;
  return (
    <motion.div
      aria-hidden
      className="absolute bottom-[-30%] w-[41%]"
      style={{ left }}
      initial={{ y: "-180%", rotate: 0 }}
      whileInView={{ y: ["-180%", "0%", "-16%", "0%"], rotate: rot }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        delay: drop,
        duration: 0.75,
        times: [0, 0.55, 0.76, 1],
        ease: ["easeIn", "easeOut", "easeIn"],
        rotate: { delay: drop, duration: 0.75 },
      }}
    >
      {/* infinite idle hop, phase-shifted per coin */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{
          delay: 2.6 + index * 0.4,
          duration: 0.5,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 2.8 + index * 0.6,
        }}
      >
        <Image src={src} alt="" width={376} height={384} className="w-full" />
      </motion.div>
    </motion.div>
  );
}

function CornerBrackets() {
  const arm = "absolute h-6 w-6 border-terracotta";
  return (
    <>
      <span aria-hidden className={`${arm} left-0 top-0 border-l-2 border-t-2`} />
      <span aria-hidden className={`${arm} right-0 top-0 border-r-2 border-t-2`} />
      <span aria-hidden className={`${arm} bottom-0 left-0 border-b-2 border-l-2`} />
      <span aria-hidden className={`${arm} bottom-0 right-0 border-b-2 border-r-2`} />
    </>
  );
}

export default function TheDeal() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-16">
      {/* token machine — LEFT on desktop, below text on mobile */}
      <Reveal delay={0.15} className="order-2 lg:order-1">
        <div
          className="relative mx-auto w-full max-w-[360px] lg:mx-0"
          style={{ containerType: "inline-size" }}
        >
          <Image
            src="/retro/token-machine-v4-cut.png"
            alt="Pixel-art Straitly token vending machine dispensing AI model tokens"
            width={430}
            height={949}
            className="w-full"
          />

          {/* marquee text on the machine's blank display */}
          <div
            aria-hidden
            className="absolute left-[22%] top-[10.5%] flex h-[12%] w-[56%] items-center justify-center"
          >
            <span
              className="font-pixel font-semibold text-[#e8a33d]"
              style={{
                fontSize: "9.5cqw",
                letterSpacing: "0.06em",
                textShadow: "0 0 12px rgba(232,163,61,0.55)",
              }}
            >
              STRAITLY
            </span>
          </div>

          {/* dispenser bin — overflow-hidden clip matching the dark opening */}
          <div className="absolute left-[25%] top-[84.2%] h-[8.4%] w-[53.5%] overflow-hidden">
            {COINS.map((c, i) => (
              <BinCoin key={c.src} index={i} {...c} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* copy — RIGHT on desktop */}
      <div className="order-1 lg:order-2">
        <Reveal>
          <div className="relative w-fit px-7 py-8 sm:px-9 sm:py-10">
            <CornerBrackets />
            <h2 className="font-pixel text-[34px] font-semibold leading-[1.16] tracking-[0.01em] text-cream sm:text-[48px] xl:text-[62px]">
              Up to <span className="text-terracotta">50% off</span>
              <br />
              frontier models.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10">
          {ROWS.map((row, i) => (
            <Reveal key={row.title} delay={0.1 + i * 0.08}>
              <div
                className={`flex items-center gap-6 py-5 ${
                  i > 0 ? "border-t border-[#4a4d54]/60" : ""
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                  <Image
                    src={row.icon}
                    alt=""
                    width={128}
                    height={128}
                    className="max-h-16 w-auto"
                  />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-cream sm:text-[22px]">
                    {row.title}
                  </h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#c4beb4]">
                    {row.sub}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <div className="mt-8">
            <a
              href="#access"
              className="inline-block bg-terracotta px-7 py-3.5 text-[15px] font-medium text-charcoal transition-colors hover:bg-terracotta-bright"
            >
              Apply for access
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
