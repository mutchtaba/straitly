"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

const ITEMS = [
  {
    q: "Why is it cheaper?",
    a: "We hold committed capacity with the frontier labs, priced far below list, and we're funded. Most companies spend their growth budget on ads. We spend ours on your inference bill. Qualified accounts get the margin, and word of mouth does the rest.",
  },
  {
    q: "Why are you doing this?",
    a: "Most YC and VC-backed startups get piles of free Anthropic and AWS credits to launch their companies. We believe every company deserves the same playing field. We can't provide free tokens, but we can provide them at a heavy discount for indie hackers and smaller startups - hoping that one day you outgrow us and secure your own enterprise deal with the providers.",
  },
  {
    q: "Who qualifies?",
    a: "Indie hackers shipping real products, startups from pre-seed through Series A, and engineering teams with real monthly inference spend. If you're actually building, you're probably in. Accounts that don't qualify simply pay each provider's list price.",
  },
  {
    q: "Do I get a free trial?",
    a: "Yes. Every new user gets $100 in credits at the discounted rates. If the trial works out and you want to go further, stay usage-based or commit for even cheaper prices.",
  },
  {
    q: "Can this replace OpenRouter, OpenAI or Anthropic?",
    a: "Yes. It's one line of change: swap the base URL, put in your API key, and your requests come to us. OpenAI-compatible API, every model in the catalog.",
  },
  {
    q: "Is this a proxy on top of my own keys?",
    a: "No. It's our infrastructure end to end. You get one OpenAI-compatible API key that routes to every provider in the catalog. You never bring your own keys, and you never touch four different billing dashboards again.",
  },
  {
    q: "How long does it take to get qualified?",
    a: "We review applications on a rolling basis. Current times are 1-2 hours.",
  },
  {
    q: "Will my rate change later?",
    a: "Usage-based rates might change with market pricing. Committed rates never change. Lock a commit and that's your price, period.",
  },
  {
    q: "What's the max traffic you can take on?",
    a: "We currently serve companies in the $2K to $100K a month range. For larger quota requirements we recommend going directly to the foundational providers - at that size you can probably secure an enterprise deal yourself.",
  },
  {
    q: "What about reliability?",
    a: "Fallbacks are built in - requests reroute across providers before you see an error. We guarantee a 99% SLA and top-of-the-line time to first token.",
  },
  {
    q: "What if I'm not happy?",
    a: "That's what the trial credits are for. Test us with $100 of real traffic, and if we're not better, walk away. No commitment, nothing to cancel.",
  },
];

function Item({
  item,
  open,
  onToggle,
}: {
  item: (typeof ITEMS)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#4a4d54]/40">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-baseline gap-4 py-6 text-left transition-colors focus:outline-none focus-visible:bg-terracotta/5"
      >
        <span
          className="w-7 shrink-0 font-pixel text-[15px] transition-colors"
          style={{ color: open ? "#e8a33d" : "#b77f5a" }}
        >
          [{open ? "-" : "+"}]
        </span>
        <span
          className="font-pixel text-[16px] font-semibold tracking-[0.02em] transition-colors sm:text-[18px]"
          style={{ color: open ? "#f0ebe2" : "#d2ccc2" }}
        >
          {item.q}
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-6 pl-[44px] text-[16px] font-medium leading-relaxed text-[#d6d0c6] sm:text-[17px]">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="w-full">
      <Reveal>
        <p className="text-center font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
          BEFORE YOU ASK
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-5 text-center font-pixel text-[30px] font-semibold leading-[1.16] text-cream sm:text-[38px]">
          Fair questions.
        </h2>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-10 border-t border-[#4a4d54]/40">
          {ITEMS.map((item, i) => (
            <Item
              key={item.q}
              item={item}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
