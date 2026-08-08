"use client";

import Image from "next/image";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";

/*
 * "Your data, not ours" — ZDR / no-training / SOC 2.
 * One retro padlock sprite carries the section; its baked-in blank LED
 * display gets a live glowing "ZDR" overlay (HTML text stays crisp at any
 * size, and lights up when the lock scrolls into view).
 */

/* the padlock's dark display window, measured off padlock-zdr.png (713x935)
   via dark-run band detection — retune if the sprite is regenerated */
const DISPLAY = { left: 12.9, top: 52.83, width: 74.19, height: 20.75 };

const CLAIMS = [
  {
    title: "Zero data retention",
    sub: "Requests and responses are never stored. Once your tokens are delivered, they're gone.",
  },
  {
    title: "Never trained on",
    sub: "Your prompts never become training data. Not ours, not the providers' we route to.",
  },
  {
    title: "SOC 2 Type II",
    sub: "Audited controls behind every request. The paperwork your security team asks for, done.",
    badge: "/logos/aicpa-soc2.png",
  },
] as const;

export default function SecuritySection() {
  const lockRef = useRef<HTMLDivElement>(null);
  const lit = useInView(lockRef, { once: true, amount: 0.5 });

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-16">
      {/* the padlock — hidden on mobile to keep the section light,
          same treatment as the token machine in TheDeal */}
      <Reveal delay={0.15} className="hidden lg:block">
        <div
          ref={lockRef}
          className="relative mx-auto w-full max-w-[270px]"
          style={{ containerType: "inline-size" }}
        >
          <Image
            src="/retro/padlock-zdr-v2.png"
            alt="Pixel-art padlock with a ZDR display, sealed shut"
            width={713}
            height={935}
            className="w-full"
          />
          {/* live text on the lock's dark LED display */}
          <div
            aria-hidden
            className="absolute flex items-center justify-center"
            style={{
              left: `${DISPLAY.left}%`,
              top: `${DISPLAY.top}%`,
              width: `${DISPLAY.width}%`,
              height: `${DISPLAY.height}%`,
            }}
          >
            <span
              className="font-pixel font-semibold transition-all duration-700"
              style={{
                fontSize: "17cqw",
                letterSpacing: "0.14em",
                paddingLeft: "0.14em",
                color: lit ? "#33ff66" : "#15351f",
                textShadow: lit ? "0 0 18px rgba(51,255,102,0.5)" : "none",
              }}
            >
              ZDR
            </span>
          </div>
        </div>
      </Reveal>

      {/* copy */}
      <div>
        <Reveal>
          <p className="font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
            YOUR DATA, NOT OURS
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-pixel text-[30px] font-semibold leading-[1.16] tracking-[0.01em] text-cream sm:text-[38px] xl:text-[44px]">
            Prompts pass through.
            <br />
            <span className="text-terracotta">They don&apos;t stay.</span>
          </h2>
        </Reveal>

        <div className="mt-10">
          {CLAIMS.map((row, i) => (
            <Reveal key={row.title} delay={0.1 + i * 0.08}>
              <div
                className={`flex items-center gap-5 py-5 ${
                  i > 0 ? "border-t border-[#4a4d54]/60" : ""
                }`}
              >
                {/* compliance mark leads the row, icon-style — the standard
                    treatment for AICPA badges (small, next to the claim) */}
                {"badge" in row && (
                  <Image
                    src={row.badge}
                    alt="AICPA SOC 2 badge"
                    width={384}
                    height={472}
                    className="h-14 w-auto shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-pixel text-lg font-semibold uppercase tracking-[0.04em] text-cream sm:text-xl">
                    {row.title}
                  </h3>
                  <p className="mt-1 max-w-[52ch] text-[15px] leading-relaxed text-[#c4beb4]">
                    {row.sub}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <p className="mt-6 font-pixel text-[10px] tracking-[0.24em] text-warm-gray sm:text-[11px]">
            ENFORCED ON EVERY REQUEST &middot; EVERY PROVIDER
          </p>
        </Reveal>
      </div>
    </div>
  );
}
