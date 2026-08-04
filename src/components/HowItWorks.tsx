"use client";

import { useInView, useScroll, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import Reveal from "@/components/Reveal";

const STEPS = [
  {
    num: "01",
    title: "Apply",
    sub: "Two minutes. Your usage and the models you need.",
  },
  {
    num: "02",
    title: "Review",
    sub: "Our team checks your quota. Hours, not weeks.",
  },
  {
    num: "03",
    title: "Get your key",
    sub: "Approved? Your key goes live with $100 in trial credits.",
  },
  {
    num: "04",
    title: "Pick your pricing",
    sub: "Trial smooth? Stay usage-based or commit. Heavy discounts either way.",
    tags: ["[ COMMIT VOLUME ]", "[ USAGE-BASED ]"],
  },
] as const;

/* vertical loading bar: scrolling the list is what fills it */
const SEGMENTS = 40;

function Row({ step }: { step: (typeof STEPS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const lit = useInView(ref, { once: true, amount: 0.6 });

  return (
    <div
      ref={ref}
      className="grid items-center gap-5 py-10 sm:py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14 lg:py-16"
    >
      {/* left: giant number + title */}
      <div>
        <p
          className="font-pixel text-[64px] font-semibold leading-none transition-colors duration-500 sm:text-[88px] lg:text-[104px]"
          style={{ color: lit ? "#c8734f" : "#494c53" }}
        >
          {step.num}
        </p>
        <h3
          className="mt-4 font-pixel text-[22px] font-semibold tracking-[0.03em] transition-colors duration-500 sm:text-[26px]"
          style={{ color: lit ? "#e8e3d8" : "#6b6e76" }}
        >
          {step.title.toUpperCase()}
        </h3>
      </div>

      {/* right: description, one line on desktop, close to the titles */}
      <div>
        <p
          className="max-w-[52ch] text-[17px] leading-relaxed transition-colors duration-500 sm:text-[18px] lg:whitespace-nowrap"
          style={{ color: lit ? "#d2ccc2" : "#6b6e76" }}
        >
          {step.sub}
        </p>
        {"tags" in step && (
          <div className="mt-4 flex flex-wrap gap-3">
            {step.tags.map((t) => (
              <span
                key={t}
                className="font-pixel text-[12px] tracking-[0.1em] transition-colors duration-500"
                style={{ color: lit ? "#e8a33d" : "#6b6e76" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const listRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(0);

  /* "end end" so the bar can always finish even when the section
     sits near the bottom of the page */
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.72", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setFilled(Math.max(0, Math.min(SEGMENTS, Math.round(v * SEGMENTS))));
  });

  const done = filled >= SEGMENTS;

  return (
    <div>
      <Reveal>
        <p className="font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
          FROM APPLY TO API KEY
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-5 max-w-[720px] font-pixel text-[30px] font-semibold leading-[1.16] tracking-[0.01em] text-cream sm:text-[38px] xl:text-[44px]">
          You could be on program rates{" "}
          <span className="text-terracotta">by tonight.</span>
        </h2>
      </Reveal>

      {/* list + spine */}
      <div className="relative mt-6 pl-9 sm:pl-14 lg:mt-10">
        {/* the spine: a segmented loading bar filled by scroll */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 top-0 flex w-2.5 flex-col gap-[3px] sm:w-3"
        >
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <div
              key={i}
              className="flex-1 transition-colors duration-150"
              style={{
                backgroundColor:
                  i < filled
                    ? i >= SEGMENTS - 3
                      ? "#e8a33d"
                      : "#c8734f"
                    : "rgba(74,77,84,0.35)",
              }}
            />
          ))}
        </div>

        <div ref={listRef} className="divide-y divide-[#4a4d54]/30">
          {STEPS.map((s) => (
            <Row key={s.num} step={s} />
          ))}
        </div>
      </div>

      {/* cap: bar completes, access granted */}
      <div className="mt-8 flex items-center gap-4 pl-9 sm:pl-14">
        <p
          className="font-pixel text-[13px] tracking-[0.22em] transition-colors duration-500 sm:text-sm"
          style={{ color: done ? "#e8a33d" : "#6b6e76" }}
        >
          {done ? "ACCESS GRANTED" : "LOADING..."}
        </p>
        {done && (
          <span
            aria-hidden
            className="inline-block h-[1em] w-[0.55em] animate-pulse bg-[#e8a33d]"
          />
        )}
      </div>
    </div>
  );
}
