"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* The Straitly guy walks in, boots "list price." off the page,
   "Start saving." slams down, he flinches, hops on top of the
   PRESS START button, and sits there lazily kicking his feet forever.
   Plays once, on scroll into view.

   Positioning model: the guy's wrapper is a ZERO-SIZE anchor point.
   The sprite is absolutely positioned inside it, centered on the anchor
   (translateX(-50%)) with its feet on the anchor's bottom. Because the
   anchor has no size, sprite swaps (different frame widths) never shift
   him, and all x/y values live in ONE continuous coordinate system —
   no phase ever restarts from 0. */

type Phase =
  | "hidden"
  | "enter"
  | "windup"
  | "kick"
  | "land"
  | "hop"
  | "sit";

const WALK_FRAME_MS = 130;
/* full stride cycle: wide-L, close-L, close-R, wide-R, close-R, close-L */
const WALK_SEQ = [1, 2, 3, 4, 3, 2];
const ENTER_MS = 1100;
const WINDUP_MS = 380;
const KICK_MS = 450;
const LAND_MS = 700;
const HOP_S = 0.75;
const SIT_FRAME_MS = 380;
const SIT_FRAMES = 4;

/* how far right of his final stop he starts walking from */
const ENTER_FROM_PX = 210;

/* sprite heights in em (bottom-anchored) */
const H_WALK = 1.2;
const H_SIT = 1.05;
/* stride sprite aspect ratio (w/h) used to estimate width pre-load */
const WALK_ASPECT = 668 / 818;
/* how far (in em) his leading boot overlaps the end of "list price." */
const KICK_OVERLAP_EM = 0.22;

/* he lands on the PRESS START button below the headline */
const SIT_TARGET_ID = "straitly-press-start";
/* where on the button he sits (fraction of its width) */
const SIT_X_FRAC = 0.7;
/* how much of the sit sprite hangs below the button's top edge
   (his dangling lower legs) */
const SIT_OVERHANG = 0.34;

export default function MascotKick() {
  const ref = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const victimRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [phase, setPhase] = useState<Phase>("hidden");
  const [walkFrame, setWalkFrame] = useState(1);
  const [sitFrame, setSitFrame] = useState(1);
  /* continuous transform targets, never reset between phases */
  const [enterX, setEnterX] = useState(0);
  const [hopTarget, setHopTarget] = useState<{ x: number; y: number } | null>(
    null,
  );
  const landXRef = useRef(0);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  /* preload every frame so sprite swaps never flicker */
  useEffect(() => {
    if (!inView || reduced) return;
    [
      ...[1, 2, 3, 4].map((i) => `/retro/guy/walkc-${i}.png`),
      ...[1, 2, 3, 4].map((i) => `/retro/guy/sitk-${i}.png`),
      "/retro/guy/frame-3.png",
      "/retro/guy/frame-4.png",
      "/retro/guy/frame-5.png",
      "/retro/guy/hop.png",
    ].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [inView, reduced]);

  /* phase timeline */
  useEffect(() => {
    if (!inView || reduced) return;

    const raf = requestAnimationFrame(() => {
      /* measure where the walk must STOP so his boot reaches the text.
         anchor = sprite center; at mount its transform x = ENTER_FROM_PX */
      const anchor = anchorRef.current;
      const victim = victimRef.current;
      if (anchor && victim) {
        const fontSize = parseFloat(getComputedStyle(victim).fontSize);
        const range = document.createRange();
        range.selectNodeContents(victim);
        const textRight = range.getBoundingClientRect().right;
        const guyW = H_WALK * fontSize * WALK_ASPECT;
        const anchorX = anchor.getBoundingClientRect().left;
        /* want: leading (left) edge of sprite = textRight - overlap */
        const targetCenter = textRight - KICK_OVERLAP_EM * fontSize + guyW / 2;
        setEnterX(ENTER_FROM_PX + (targetCenter - anchorX));
      }
      setPhase("enter");
    });

    const t: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase("windup"), ENTER_MS),
      setTimeout(() => setPhase("kick"), ENTER_MS + WINDUP_MS),
      setTimeout(() => setPhase("land"), ENTER_MS + WINDUP_MS + KICK_MS),
      setTimeout(() => {
        /* measure the hop target right before jumping — the parabola
           must END on the button, so landing needs zero correction */
        const anchor = anchorRef.current;
        const btn = document.getElementById(SIT_TARGET_ID);
        if (anchor && btn) {
          const a = anchor.getBoundingClientRect();
          const b = btn.getBoundingClientRect();
          const fontSize = parseFloat(getComputedStyle(anchor).fontSize);
          const sitH = H_SIT * fontSize;
          const currentX = landXRef.current;
          setHopTarget({
            x: currentX + (b.left + b.width * SIT_X_FRAC - a.left),
            /* anchor bottom = his feet; land with lower legs dangling
               over the button face */
            y: b.top + sitH * SIT_OVERHANG - a.bottom,
          });
        }
        setPhase("hop");
        /* sit is triggered by the hop animation completing, not a timer */
      }, ENTER_MS + WINDUP_MS + KICK_MS + LAND_MS),
    ];
    return () => {
      cancelAnimationFrame(raf);
      t.forEach(clearTimeout);
    };
  }, [inView, reduced]);

  /* step through the stride cycle while walking in */
  useEffect(() => {
    if (phase !== "enter") return;
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % WALK_SEQ.length;
      setWalkFrame(WALK_SEQ[i]);
    }, WALK_FRAME_MS);
    return () => clearInterval(iv);
  }, [phase]);

  /* lazy feet-swing loop, forever */
  useEffect(() => {
    if (phase !== "sit") return;
    const iv = setInterval(
      () => setSitFrame((f) => (f % SIT_FRAMES) + 1),
      SIT_FRAME_MS,
    );
    return () => clearInterval(iv);
  }, [phase]);

  /* reduced motion: final scene, no theatrics */
  if (reduced) {
    return (
      <span className="relative inline-block whitespace-nowrap">
        <span className="text-[#e8a33d]">Start saving.</span>
        <span
          aria-hidden
          className="absolute bottom-[0.48em] left-[60%] inline-block -translate-x-1/2"
        >
          <Image
            src="/retro/guy/sitk-2.png"
            alt=""
            width={235}
            height={374}
            unoptimized
            className="h-[1.05em] w-auto max-w-none"
            style={{ imageRendering: "pixelated" }}
          />
        </span>
      </span>
    );
  }

  const kicked = phase !== "hidden" && phase !== "enter" && phase !== "windup";
  const landed = phase === "land" || phase === "hop" || phase === "sit";
  const sitting = phase === "sit";

  const frameSrc =
    phase === "enter"
      ? `/retro/guy/walkc-${walkFrame}.png`
      : phase === "windup"
        ? "/retro/guy/frame-3.png"
        : phase === "kick"
          ? "/retro/guy/frame-4.png"
          : phase === "land"
            ? "/retro/guy/frame-5.png"
            : phase === "hop"
              ? "/retro/guy/hop.png"
              : `/retro/guy/sitk-${sitFrame}.png`;

  /* every ground/air frame faces right in the sheet; he travels left,
     so mirror them all — the facing never flips mid-walk */
  const flipped = !sitting;

  landXRef.current = enterX + 10;

  /* guy motion per phase — one continuous coordinate system */
  const guyAnimate =
    phase === "enter"
      ? { x: enterX, y: 0 }
      : phase === "windup" || phase === "kick"
        ? { x: enterX, y: 0 }
        : phase === "land"
          ? { x: [enterX, enterX + 16, enterX + 10], y: 0 }
          : phase === "hop" && hopTarget
            ? {
                /* one parabolic leap: push off, apex, fall onto the button */
                x: [landXRef.current, hopTarget.x],
                y: [0, -75, hopTarget.y],
              }
            : sitting && hopTarget
              ? { x: hopTarget.x, y: hopTarget.y }
              : { x: ENTER_FROM_PX, y: 0 };

  const guyTransition =
    phase === "enter"
      ? { duration: ENTER_MS / 1000, ease: "linear" as const }
      : phase === "land"
        ? { duration: 0.3, times: [0, 0.4, 1] }
        : phase === "hop"
          ? {
              duration: HOP_S,
              x: { duration: HOP_S, ease: "linear" as const },
              /* rise decelerates to the apex, fall accelerates down */
              y: {
                duration: HOP_S,
                times: [0, 0.42, 1],
                ease: ["easeOut", "easeIn"],
              },
            }
          : { duration: 0 };

  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap">
      {/* invisible sizer: the wrapper is as wide as the FINAL text, so
          the drop never overlaps the guy standing to the right */}
      <span aria-hidden className="invisible">
        Start saving.
      </span>

      {/* the victim: centered over the sizer, kicked off the page */}
      <motion.span
        ref={victimRef}
        className="absolute left-0 top-0 w-full text-center text-terracotta"
        animate={
          kicked
            ? {
                x: [0, -160, -380],
                y: [0, -90, 340],
                rotate: [0, -25, -80],
                opacity: [1, 1, 0],
              }
            : { x: 0, y: 0, rotate: 0, opacity: 1 }
        }
        transition={
          kicked
            ? { duration: 0.85, times: [0, 0.4, 1], ease: "easeIn" }
            : { duration: 0 }
        }
      >
        list price.
      </motion.span>

      {/* the replacement: drops in and bounces once the dust settles */}
      {landed && (
        <motion.span
          className="absolute left-0 top-0 w-full text-center text-[#e8a33d]"
          initial={{ y: "-1.4em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 14 }}
        >
          Start saving.
        </motion.span>
      )}

      {/* the Straitly guy — zero-size anchor, sprite centered on it */}
      {phase !== "hidden" && (
        <motion.span
          ref={anchorRef}
          aria-hidden
          className="absolute bottom-[0.06em] left-full z-20 ml-3 block h-0 w-0"
          initial={{ x: ENTER_FROM_PX, y: 0 }}
          animate={guyAnimate}
          transition={guyTransition}
          onAnimationComplete={() => {
            if (phase === "hop") setPhase("sit");
          }}
        >
          <Image
            src={frameSrc}
            alt=""
            width={420}
            height={478}
            unoptimized
            className={`absolute bottom-0 left-0 w-auto max-w-none ${
              sitting || phase === "hop" ? "h-[1.05em]" : "h-[1.2em]"
            }`}
            style={{
              imageRendering: "pixelated",
              transform: flipped
                ? "translateX(-50%) scaleX(-1)"
                : "translateX(-50%)",
            }}
          />
        </motion.span>
      )}
    </span>
  );
}
