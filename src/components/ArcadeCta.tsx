"use client";

import type { ReactNode } from "react";
import { openApplyModal } from "@/components/ApplyModal";

/* Every CTA on the page shares this: on hover, a pixel menu cursor
   blinks in on the left, like selecting an option in an old RPG.
   Without an href, the CTA opens the qualification modal. */

type Props = {
  href?: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "header";
  className?: string;
};

const CURSOR = "\u25B6";

const STYLES: Record<NonNullable<Props["variant"]>, string> = {
  header:
    "group relative border border-terracotta py-1.5 pl-7 pr-3.5 text-xs text-terracotta transition-colors hover:bg-terracotta hover:text-charcoal",
  outline:
    "group relative inline-flex items-center gap-2.5 border border-warm-gray/40 py-3.5 pl-10 pr-7 text-[15px] text-cream transition-colors hover:border-cream",
  solid:
    "group relative inline-block bg-terracotta py-3.5 pl-10 pr-7 text-[15px] font-medium text-charcoal transition-colors hover:bg-terracotta-bright",
};

const CURSOR_STYLES: Record<NonNullable<Props["variant"]>, string> = {
  header: "cta-cursor absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px]",
  outline: "cta-cursor absolute left-4 top-1/2 -translate-y-1/2 text-[11px]",
  solid: "cta-cursor absolute left-4 top-1/2 -translate-y-1/2 text-[11px]",
};

export default function ArcadeCta({
  href,
  children,
  variant = "solid",
  className = "",
}: Props) {
  const cursor = (
    <span aria-hidden className={CURSOR_STYLES[variant]}>
      {CURSOR}
    </span>
  );

  if (href) {
    return (
      <a href={href} className={`${STYLES[variant]} ${className}`}>
        {cursor}
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={openApplyModal}
      className={`${STYLES[variant]} ${className}`}
    >
      {cursor}
      {children}
    </button>
  );
}
