"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const APPLY_OPEN_EVENT = "straitly:apply-open";

export function openApplyModal() {
  window.dispatchEvent(new CustomEvent(APPLY_OPEN_EVENT));
}

const SPEND_TIERS = [
  "Under $200",
  "$200 - $2K",
  "$2K - $10K",
  "$10K - $50K",
  "$50K+",
];

const PROVIDERS = [
  "OpenRouter",
  "Anthropic",
  "OpenAI",
  "Google",
  "Meta",
  "Other",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Spain",
  "Portugal",
  "Ireland",
  "Poland",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "Israel",
  "United Arab Emirates",
  "Other",
];

const FIELD =
  "w-full border border-[#4a4d54] bg-[#242629] px-4 py-3.5 text-[15px] text-cream placeholder:text-[#6b6e76] focus:border-terracotta focus:outline-none";

const LABEL =
  "mb-3 block font-pixel text-[11px] uppercase tracking-[0.22em] text-[#c4beb4]";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="border px-4 py-2.5 font-pixel text-[12px] tracking-[0.08em] transition-colors focus:outline-none focus-visible:border-cream"
      style={{
        borderColor: active ? "#b77f5a" : "rgba(74,77,84,0.8)",
        backgroundColor: active ? "rgba(183,127,90,0.15)" : "transparent",
        color: active ? "#f0ebe2" : "#9a948b",
      }}
    >
      {label}
    </button>
  );
}

/* custom, on-theme country picker: pixel panel that unfolds like a
   game menu, with the ▶ cursor tracking the hovered option */
function CountrySelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    /* capture phase so Escape closes the dropdown before the modal */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`${FIELD} flex items-center justify-between text-left`}
        style={{ color: value ? "#f0ebe2" : "#6b6e76" }}
      >
        <span>{value ?? "Select country"}</span>
        <span
          aria-hidden
          className="font-pixel text-[10px] text-terracotta transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        >
          &#9660;
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, scaleY: 0.7, y: -4 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.7, y: -4 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 origin-top overflow-y-auto border border-[#4a4d54] bg-[#242629] shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            {COUNTRIES.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === c}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className="group/opt flex w-full items-center gap-2 px-4 py-2.5 text-left font-pixel text-[13px] tracking-[0.04em] transition-colors hover:bg-terracotta/15"
                  style={{ color: value === c ? "#e8a33d" : "#d2ccc2" }}
                >
                  <span
                    aria-hidden
                    className="w-3 shrink-0 text-[9px] text-terracotta opacity-0 transition-opacity group-hover/opt:opacity-100"
                  >
                    &#9654;
                  </span>
                  {c}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalForm({ onClose }: { onClose: () => void }) {
  const [spend, setSpend] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [country, setCountry] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [receivedAt, setReceivedAt] = useState("");

  const toggleProvider = (p: string) =>
    setProviders((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p],
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spend || !country) return;
    setScorePop(true);
    setReceivedAt(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
    setTimeout(() => setSubmitted(true), 550);
  };

  if (submitted) {
    return (
      <div>
        <div className="px-7 py-14 text-center">
          <p className="font-pixel text-[15px] tracking-[0.24em] text-[#e8a33d]">
            APPLICATION RECEIVED
          </p>
          <p className="mt-4 font-pixel text-[11px] tracking-[0.16em] text-[#c4beb4]">
            {receivedAt} &middot; REVIEW USUALLY TAKES ~3 HOURS
          </p>
          <p className="mx-auto mt-6 max-w-[400px] text-[14px] leading-relaxed text-[#c4beb4]">
            Watch your inbox. If you qualify, your API key and $100 in trial
            credits arrive in the approval email.
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-[#4a4d54]/60 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-[11px] tracking-[0.18em] text-warm-gray transition-colors hover:text-cream focus:outline-none"
          >
            [ESC] CLOSE
          </button>
          <span className="font-pixel text-[11px] tracking-[0.18em] text-[#e8a33d]">
            +100
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="max-h-[68vh] overflow-y-auto px-10 pb-8 pt-8">
        <div>
          <label htmlFor="apply-email" className={LABEL}>
            Email *
          </label>
          <input
            id="apply-email"
            type="email"
            required
            autoFocus
            placeholder="you@company.com"
            className={FIELD}
          />
          <p className="mt-2 text-[12px] text-[#8d9098]">
            Work email helps us verify faster. Personal is fine too.
          </p>
        </div>

        <div className="mt-8">
          <span className={LABEL}>Current monthly inference spend *</span>
          <div className="flex flex-wrap gap-2.5">
            {SPEND_TIERS.map((tier) => (
              <Chip
                key={tier}
                label={tier}
                active={spend === tier}
                onClick={() => setSpend(tier)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <span className={LABEL}>Who do you use today?</span>
          <div className="flex flex-wrap gap-2.5">
            {PROVIDERS.map((p) => (
              <Chip
                key={p}
                label={p}
                active={providers.includes(p)}
                onClick={() => toggleProvider(p)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label htmlFor="apply-models" className={LABEL}>
            Which models do you run?
          </label>
          <input
            id="apply-models"
            type="text"
            placeholder="claude-sonnet-5, gpt-5.6-terra, gemini-3.6-flash..."
            className={FIELD}
          />
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-6">
          <div>
            <label htmlFor="apply-company" className={LABEL}>
              Company
            </label>
            <input
              id="apply-company"
              type="text"
              placeholder="Or LinkedIn / GitHub if solo"
              className={FIELD}
            />
          </div>
          <div>
            <span className={LABEL}>Based in *</span>
            <CountrySelect value={country} onChange={setCountry} />
          </div>
        </div>

        <p className="mt-9 text-center font-pixel text-[10px] tracking-[0.22em] text-warm-gray">
          NO SALES CALL &middot; NO COMMITMENT &middot; KEYS LIVE IN HOURS
        </p>
      </div>

      {/* game-dialog footer: exit bottom-left, start bottom-right */}
      <div className="relative flex items-center justify-between border-t border-[#4a4d54]/60 px-7 py-5">
        {scorePop && (
          <span
            aria-hidden
            className="animate-score-pop pointer-events-none absolute right-16 top-0 font-pixel text-lg font-semibold text-[#e8a33d]"
          >
            +100
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="font-pixel text-[11px] tracking-[0.18em] text-warm-gray transition-colors hover:text-cream focus:outline-none"
        >
          [ESC] EXIT
        </button>
        <button
          type="submit"
          disabled={!spend || !country}
          className="relative bg-terracotta px-7 py-3 font-pixel text-[13px] font-semibold tracking-[0.14em] text-charcoal transition-colors hover:bg-terracotta-bright disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden className="absolute left-0 top-0 h-1 w-1 bg-[#2a2c30]" />
          <span aria-hidden className="absolute right-0 top-0 h-1 w-1 bg-[#2a2c30]" />
          <span aria-hidden className="absolute bottom-0 left-0 h-1 w-1 bg-[#2a2c30]" />
          <span aria-hidden className="absolute bottom-0 right-0 h-1 w-1 bg-[#2a2c30]" />
          PRESS START [&#8629;]
        </button>
      </div>
    </form>
  );
}

export default function ApplyModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(APPLY_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(APPLY_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />

          {/* dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Qualification application"
            className="relative w-full max-w-[760px] border-2 border-[#4a4d54] bg-[#2a2c30] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
          >
            {/* pixel corner accents on the dialog frame */}
            <span aria-hidden className="absolute -left-[2px] -top-[2px] h-2.5 w-2.5 bg-terracotta" />
            <span aria-hidden className="absolute -right-[2px] -top-[2px] h-2.5 w-2.5 bg-terracotta" />
            <span aria-hidden className="absolute -bottom-[2px] -left-[2px] h-2.5 w-2.5 bg-terracotta" />
            <span aria-hidden className="absolute -bottom-[2px] -right-[2px] h-2.5 w-2.5 bg-terracotta" />

            {/* title bar */}
            <div className="flex items-center justify-between border-b border-[#4a4d54]/60 px-7 py-4">
              <p className="font-pixel text-[13px] tracking-[0.24em] text-cream">
                QUALIFICATION FORM
              </p>
              <p className="font-pixel text-[12px] tracking-[0.18em] text-[#e8a33d]">
                ~2 MIN
              </p>
            </div>

            <ModalForm onClose={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
