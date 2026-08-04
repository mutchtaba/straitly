"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import ArcadeCta from "@/components/ArcadeCta";

const ROWS = [
  {
    icon: "/retro/icon-hacker-cut.png",
    title: "Indie hackers",
    sub: "Solo devs shipping real products.",
  },
  {
    icon: "/retro/icon-rocket-cut.png",
    title: "Small startups",
    sub: "Pre-seed through Series A, before the bill gets scary.",
  },
  {
    icon: "/retro/icon-terminals-cut.png",
    title: "Engineering teams",
    sub: "Teams spending real money on inference every month.",
  },
] as const;

/* The dispenser alcove, measured off token-machine-v4-cut.png (430x949):
   the dark opening runs x 12.3%–87.0%, from y 79.3% down to the tray
   lip's top highlight at 90.83%. Coins live inside an overflow-hidden div
   matching that box, so a coin is only ever visible inside the alcove: it
   drops in from the shadow above and its base is cut exactly on the lip's
   edge, which reads as the lip occluding it. Nothing ever crosses the
   machine's face. Retune these numbers if the machine art changes. */
const BIN = "absolute left-[12.3%] top-[79.3%] h-[11.53%] w-[74.7%]";

const COINS = [
  { src: "/retro/coin-openai-cut.png", left: "1%", rot: -8 },
  { src: "/retro/coin-meta-cut.png", left: "24%", rot: 6 },
  { src: "/retro/coin-ai-cut.png", left: "47%", rot: -5 },
  { src: "/retro/coin-gemini-cut.png", left: "70%", rot: 9 },
] as const;

/* `dispensed` is driven by an observer on the machine itself, not on the
   coin. The coin starts fully outside the alcove clip, so its own
   intersection ratio is permanently 0 and a whileInView on it can never
   fire. */
function BinCoin({
  src,
  left,
  rot,
  index,
  dispensed,
  spent,
}: {
  src: string;
  left: string;
  rot: number;
  index: number;
  dispensed: boolean;
  spent: boolean;
}) {
  const drop = 0.35 + index * 0.28;
  return (
    <motion.div
      aria-hidden
      className="absolute bottom-[-18%] w-[29%]"
      style={{ left }}
      initial={{ y: "-190%", rotate: 0 }}
      animate={
        spent
          ? // rolled out of the pan and spent on the TVs below: the pan empties
            { y: "160%", rotate: rot + 40, transition: { delay: index * 0.12, duration: 0.5, ease: "easeIn" } }
          : dispensed
            ? { y: ["-190%", "0%", "-14%", "0%"], rotate: rot }
            : { y: "-190%", rotate: 0 }
      }
      transition={{
        delay: drop,
        duration: 0.72,
        times: [0, 0.56, 0.78, 1],
        ease: ["easeIn", "easeOut", "easeIn"],
        rotate: { delay: drop, duration: 0.72 },
      }}
    >
      {/* infinite idle hop, phase-shifted per coin */}
      <motion.div
        animate={dispensed && !spent ? { y: [0, -5, 0] } : { y: 0 }}
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
  const machineRef = useRef<HTMLDivElement>(null);
  const dispensed = useInView(machineRef, { once: true, amount: 0.3 });
  const [spent, setSpent] = useState(false);

  /* the model TVs below spend these exact coins */
  useEffect(() => {
    const onSpent = () => setSpent(true);
    window.addEventListener("straitly:coins-spent", onSpent);
    return () => window.removeEventListener("straitly:coins-spent", onSpent);
  }, []);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-16">
      {/* token machine — LEFT on desktop, below text on mobile */}
      <Reveal delay={0.15} className="order-2 lg:order-1">
        <div
          ref={machineRef}
          id="straitly-dispenser"
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
            className="absolute left-[20%] top-[9%] flex h-[12.6%] w-[60%] items-center justify-center"
          >
            <span
              className="font-pixel font-semibold text-[#e8a33d]"
              style={{
                fontSize: "9.5cqw",
                letterSpacing: "0.06em",
                paddingLeft: "0.06em",
                textShadow: "0 0 12px rgba(232,163,61,0.55)",
              }}
            >
              STRAITLY
            </span>
          </div>

          {/* dispenser alcove — overflow-hidden clip matching the opening */}
          <div className={`${BIN} overflow-hidden`}>
            {COINS.map((c, i) => (
              <BinCoin
                key={c.src}
                index={i}
                dispensed={dispensed}
                spent={spent}
                {...c}
              />
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
                  <h3 className="font-pixel text-lg font-semibold uppercase tracking-[0.04em] text-cream sm:text-xl">
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
            <ArcadeCta>Claim your rate</ArcadeCta>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
