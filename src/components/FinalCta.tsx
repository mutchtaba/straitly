"use client";

import Reveal from "@/components/Reveal";
import MascotKick from "@/components/MascotKick";
import { openApplyModal } from "@/components/ApplyModal";

export default function FinalCta() {
  return (
    <div className="mx-auto w-full max-w-[1360px] px-6 pt-20 md:pt-28">
      <div className="relative flex w-full flex-col items-center px-6 py-16 text-center md:py-24">
        {/* the deal-frame corner brackets, scoping the final stage */}
        <span aria-hidden className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-terracotta" />
        <span aria-hidden className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-terracotta" />
        <span aria-hidden className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-terracotta" />
        <span aria-hidden className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-terracotta" />
      <p className="animate-attract-blink font-pixel text-[13px] tracking-[0.34em] text-[#e8a33d]">
        FINAL STAGE
      </p>

      <h2 className="mt-8 max-w-[900px] font-pixel text-[40px] font-semibold leading-[1.08] tracking-[0.01em] text-cream sm:text-[56px] xl:text-[68px]">
        Stop paying <MascotKick />
      </h2>

      <Reveal delay={0.15}>
        <p className="mt-8 max-w-[520px] text-[16px] leading-relaxed text-[#c4beb4] sm:text-[17px]">
          Two minutes, five questions. Qualify and your key is live today with
          $100 in trial credits.
        </p>
      </Reveal>

      <Reveal delay={0.25}>
        <button
          id="straitly-press-start"
          type="button"
          onClick={openApplyModal}
          className="group relative mt-10 inline-block bg-terracotta px-12 py-4 font-pixel text-[16px] font-semibold tracking-[0.14em] text-charcoal transition-colors hover:bg-terracotta-bright sm:px-14 sm:py-5"
        >
          <span aria-hidden className="absolute left-0 top-0 h-1.5 w-1.5 bg-charcoal" />
          <span aria-hidden className="absolute right-0 top-0 h-1.5 w-1.5 bg-charcoal" />
          <span aria-hidden className="absolute bottom-0 left-0 h-1.5 w-1.5 bg-charcoal" />
          <span aria-hidden className="absolute bottom-0 right-0 h-1.5 w-1.5 bg-charcoal" />
          PRESS START
        </button>
      </Reveal>

      <Reveal delay={0.35}>
        <p className="mt-8 font-pixel text-[11px] tracking-[0.22em] text-warm-gray">
          $100 FREE CREDITS &middot; NO COMMITMENT &middot; NO SALES CALL
        </p>
      </Reveal>
      </div>
    </div>
  );
}
