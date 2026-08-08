"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ArcadeCta from "@/components/ArcadeCta";
import { openApplyModal } from "@/components/ApplyModal";

/*
 * Plain fixed header, edge to edge: announcement strip on top (the alpha
 * offer, clicks through to the pricing section), solid nav bar under it.
 * No pill, no shrinking, no rounding — it just sits there like a header.
 *
 * RELIABILITY / SPEED / COST don't anchor-jump: they tell the routing
 * showcase which slide to show via a custom event, then it scrolls itself.
 */

const SLIDE_NAV = [
  { label: "RELIABILITY", stage: 1 },
  { label: "SPEED", stage: 2 },
  { label: "COST", stage: 3 },
] as const;

function goToSlide(stage: number) {
  window.dispatchEvent(
    new CustomEvent("straitly:goto-stage", { detail: stage }),
  );
}

/* the tiny mascot waving hello right before the announcement text —
   two generated frames of the same miner, swapped like a sprite sheet
   (hand swings in on frame a, out on frame b: a side-to-side wave) */
function MiniMascot() {
  const [frame, setFrame] = useState<"a" | "b">("a");

  useEffect(() => {
    const id = setInterval(
      () => setFrame((f) => (f === "a" ? "b" : "a")),
      500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/retro/guy/wavey-${frame}.png?v=2`}
      alt=""
      aria-hidden
      className="pointer-events-none h-7 w-auto"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/* the numbers that sell the deal — bolded, with a hairline stroke so the
   pixel font actually reads heavier at 10px */
function Loud({ children }: { children: React.ReactNode }) {
  return (
    <b className="font-bold" style={{ WebkitTextStroke: "0.25px #1d1e22" }}>
      {children}
    </b>
  );
}

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* announcement: the one loud thing on the page, so it's terracotta.
          Clicking anywhere on it opens the qualification form, same as the
          "Claim your rate" CTA */}
      <button
        type="button"
        onClick={openApplyModal}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 bg-terracotta px-4 py-1.5 text-center font-pixel text-[10px] font-semibold tracking-[0.1em] text-[#1d1e22] transition-colors hover:bg-terracotta-bright sm:text-[11px]"
      >
        <MiniMascot />
        <span>
          STRAITLY IS NOW IN <Loud>ALPHA</Loud> &middot; UP TO{" "}
          <Loud>50%</Loud> OFF FRONTIER MODELS ON YOUR FIRST{" "}
          <Loud>$100K</Loud> &middot;{" "}
          <span className="underline underline-offset-2">
            SEE IF YOU QUALIFY
          </span>
        </span>
      </button>

      {/* the bar: solid, full-width, hairline under it, nothing moves */}
      <div className="border-b border-warm-gray/15 bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-6 py-3">
          <a href="#access" className="flex items-center gap-2.5">
            <Image
              src="/straitly-mark.svg"
              alt="Straitly compass logo"
              width={26}
              height={26}
              priority
            />
            <span
              className="font-pixel text-lg tracking-wide text-cream"
              style={{ WebkitTextStroke: "0.6px var(--cream)" }}
            >
              straitly
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#models"
              className="font-pixel text-[11px] tracking-[0.16em] text-[#c4beb4] transition-colors hover:text-cream"
            >
              MODELS
            </a>
            {SLIDE_NAV.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => goToSlide(item.stage)}
                className="font-pixel text-[11px] tracking-[0.16em] text-[#c4beb4] transition-colors hover:text-cream"
              >
                {item.label}
              </button>
            ))}
            <a
              href="#security"
              className="font-pixel text-[11px] tracking-[0.16em] text-[#c4beb4] transition-colors hover:text-cream"
            >
              SECURITY
            </a>
          </nav>

          <ArcadeCta variant="header">Request access</ArcadeCta>
        </div>
      </div>
    </header>
  );
}
