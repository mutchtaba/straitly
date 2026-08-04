"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

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

const INPUT =
  "w-full border-b-2 border-[#4a4d54] bg-transparent px-1 pb-3 pt-1 text-[22px] text-cream placeholder:text-[#5a5d64] focus:border-terracotta focus:outline-none sm:text-[26px]";

/* one question per screen, fully keyboard driven:
   [↵] next · [⌫] back (on empty fields / choice steps) · [ESC] exit
   arrows move the menu cursor, 1-9 quick-pick, space toggles multi */

type StepKind = "email" | "single" | "multi" | "text" | "country" | "review";

type Step = {
  id: string;
  kind: StepKind;
  q: string;
  hint?: string;
  options?: string[];
  placeholder?: string;
  required: boolean;
};

const STEPS: Step[] = [
  {
    id: "email",
    kind: "email",
    q: "Where do we send your key?",
    hint: "Work email helps us verify faster. Personal is fine too.",
    placeholder: "you@company.com",
    required: true,
  },
  {
    id: "spend",
    kind: "single",
    q: "Current monthly inference spend?",
    options: SPEND_TIERS,
    required: true,
  },
  {
    id: "providers",
    kind: "multi",
    q: "Who do you use today?",
    hint: "Pick all that apply.",
    options: PROVIDERS,
    required: false,
  },
  {
    id: "models",
    kind: "text",
    q: "Which models do you run?",
    placeholder: "claude-sonnet-5, gpt-5.6-terra, gemini-3.6-flash...",
    required: false,
  },
  {
    id: "company",
    kind: "text",
    q: "Company?",
    hint: "Or a LinkedIn / GitHub if you're solo.",
    placeholder: "Acme Inc",
    required: false,
  },
  {
    id: "country",
    kind: "country",
    q: "Where are you based?",
    required: true,
  },
  { id: "review", kind: "review", q: "Ready?", required: false },
];

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

function ModalWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    providers: [],
  });
  const [cursor, setCursor] = useState(0);
  const [filter, setFilter] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [receivedAt, setReceivedAt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const cur = STEPS[step];
  const countryList = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(filter.toLowerCase()),
  );
  const menu =
    cur.kind === "country" ? countryList : (cur.options ?? []);

  const valueOf = (id: string) => (answers[id] as string) ?? "";

  const stepValid = useCallback(() => {
    if (cur.kind === "email") return isEmail(valueOf("email"));
    if (cur.kind === "single") return !!answers[cur.id];
    if (cur.kind === "country") return !!answers.country;
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, answers]);

  const go = useCallback(
    (next: number) => {
      setDir(next > step ? 1 : -1);
      setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
      setCursor(0);
      setFilter("");
    },
    [step],
  );

  const advance = useCallback(() => {
    if (!stepValid()) return;
    if (step < STEPS.length - 1) go(step + 1);
  }, [step, stepValid, go]);

  const submit = useCallback(() => {
    setScorePop(true);
    setReceivedAt(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );
    /* fire the application to the backend; the arcade flow never blocks on it */
    fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: (answers.email as string) ?? "",
        spend: (answers.spend as string) ?? "",
        providers: (answers.providers as string[]) ?? [],
        models: (answers.models as string) ?? "",
        company: (answers.company as string) ?? "",
        country: (answers.country as string) ?? "",
      }),
    }).catch(() => {});
    setTimeout(() => setSubmitted(true), 550);
  }, [answers]);

  /* text inputs focus via autoFocus on mount — a timer misses because
     the new step only mounts after the exit animation completes */

  /* keep the highlighted country in view */
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor, filter]);

  /* the wizard keyboard: one handler drives every step */
  useEffect(() => {
    if (submitted) return;
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement && e.target.value.length > 0;

      if (e.key === "Enter") {
        e.preventDefault();
        if (cur.kind === "review") return submit();
        if (cur.kind === "single") {
          setAnswers((a) => ({ ...a, [cur.id]: menu[cursor] }));
          /* selection + advance in one press, like a game menu */
          setTimeout(() => go(step + 1), 120);
          return;
        }
        if (cur.kind === "country") {
          if (!menu.length) return;
          setAnswers((a) => ({ ...a, country: menu[cursor] }));
          setTimeout(() => go(step + 1), 120);
          return;
        }
        advance();
        return;
      }

      if (e.key === "Backspace" && !typing && step > 0) {
        e.preventDefault();
        go(step - 1);
        return;
      }

      const isMenu =
        cur.kind === "single" || cur.kind === "multi" || cur.kind === "country";
      if (!isMenu) return;

      if (["ArrowDown", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setCursor((c) => (c + 1) % Math.max(menu.length, 1));
      } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        setCursor((c) => (c - 1 + Math.max(menu.length, 1)) % Math.max(menu.length, 1));
      } else if (e.key === " " && cur.kind === "multi") {
        e.preventDefault();
        const opt = menu[cursor];
        setAnswers((a) => {
          const curSel = (a.providers as string[]) ?? [];
          return {
            ...a,
            providers: curSel.includes(opt)
              ? curSel.filter((x) => x !== opt)
              : [...curSel, opt],
          };
        });
      } else if (/^[1-9]$/.test(e.key) && cur.kind !== "country") {
        const i = Number(e.key) - 1;
        if (i >= menu.length) return;
        e.preventDefault();
        setCursor(i);
        if (cur.kind === "single") {
          setAnswers((a) => ({ ...a, [cur.id]: menu[i] }));
          setTimeout(() => go(step + 1), 120);
        } else {
          const opt = menu[i];
          setAnswers((a) => {
            const curSel = (a.providers as string[]) ?? [];
            return {
              ...a,
              providers: curSel.includes(opt)
                ? curSel.filter((x) => x !== opt)
                : [...curSel, opt],
            };
          });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cur, cursor, menu, step, submitted, advance, go, submit]);

  if (submitted) {
    return (
      <div>
        <div className="px-7 py-14 text-center">
          <p className="font-pixel text-[15px] tracking-[0.24em] text-[#e8a33d]">
            APPLICATION RECEIVED
          </p>
          <p className="mt-4 font-pixel text-[11px] tracking-[0.16em] text-[#c4beb4]">
            {receivedAt} &middot; REVIEW USUALLY TAKES 1-2 HOURS
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

  const providersSel = (answers.providers as string[]) ?? [];

  return (
    <div>
      <div className="min-h-[380px] overflow-hidden px-8 pb-6 pt-8 sm:px-12 sm:pt-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={cur.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 42 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -42 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {cur.kind !== "review" && (
              <>
                <p className="font-pixel text-[11px] tracking-[0.28em] text-[#e8a33d]">
                  {String(step + 1).padStart(2, "0")} /{" "}
                  {String(STEPS.length - 1).padStart(2, "0")}
                  {cur.required && " · REQUIRED"}
                </p>
                <h3 className="mt-4 font-pixel text-[24px] font-semibold leading-[1.2] text-cream sm:text-[30px]">
                  {cur.q}
                </h3>
                {cur.hint && (
                  <p className="mt-3 text-[14px] text-[#8d9098]">{cur.hint}</p>
                )}
              </>
            )}

            {(cur.kind === "email" || cur.kind === "text") && (
              <input
                ref={inputRef}
                autoFocus
                type={cur.kind === "email" ? "email" : "text"}
                value={valueOf(cur.id)}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [cur.id]: e.target.value }))
                }
                placeholder={cur.placeholder}
                className={`${INPUT} mt-10`}
              />
            )}

            {(cur.kind === "single" || cur.kind === "multi") && (
              <ul className="mt-9 space-y-1">
                {menu.map((opt, i) => {
                  const active = i === cursor;
                  const chosen =
                    cur.kind === "single"
                      ? answers[cur.id] === opt
                      : providersSel.includes(opt);
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => {
                          if (cur.kind === "single") {
                            setAnswers((a) => ({ ...a, [cur.id]: opt }));
                            setTimeout(() => go(step + 1), 120);
                          } else {
                            setAnswers((a) => {
                              const s = (a.providers as string[]) ?? [];
                              return {
                                ...a,
                                providers: s.includes(opt)
                                  ? s.filter((x) => x !== opt)
                                  : [...s, opt],
                              };
                            });
                          }
                        }}
                        className="flex w-full items-center gap-3 px-2 py-2.5 text-left font-pixel text-[16px] tracking-[0.04em] transition-colors sm:text-[18px]"
                        style={{
                          color: chosen
                            ? "#e8a33d"
                            : active
                              ? "#f0ebe2"
                              : "#9a948b",
                          backgroundColor: active
                            ? "rgba(183,127,90,0.10)"
                            : "transparent",
                        }}
                      >
                        <span
                          aria-hidden
                          className="w-4 shrink-0 text-[11px] text-terracotta"
                          style={{
                            opacity: active ? 1 : 0,
                            animation: active
                              ? "cursor-blink 1.1s step-end infinite"
                              : undefined,
                          }}
                        >
                          &#9654;
                        </span>
                        <span className="w-5 shrink-0 text-[12px] text-[#6b6e76]">
                          {i + 1}
                        </span>
                        {opt}
                        {cur.kind === "multi" && chosen && (
                          <span className="ml-auto text-[12px] text-[#e8a33d]">
                            [x]
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {cur.kind === "country" && (
              <>
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCursor(0);
                  }}
                  placeholder="Type to search..."
                  className={`${INPUT} mt-8 text-[18px] sm:text-[20px]`}
                />
                <ul
                  ref={listRef}
                  className="mt-4 max-h-[220px] overflow-y-auto"
                >
                  {countryList.map((c, i) => {
                    const active = i === cursor;
                    return (
                      <li key={c} data-active={active}>
                        <button
                          type="button"
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => {
                            setAnswers((a) => ({ ...a, country: c }));
                            setTimeout(() => go(step + 1), 120);
                          }}
                          className="flex w-full items-center gap-3 px-2 py-2 text-left font-pixel text-[15px] tracking-[0.04em]"
                          style={{
                            color:
                              answers.country === c
                                ? "#e8a33d"
                                : active
                                  ? "#f0ebe2"
                                  : "#9a948b",
                            backgroundColor: active
                              ? "rgba(183,127,90,0.10)"
                              : "transparent",
                          }}
                        >
                          <span
                            aria-hidden
                            className="w-4 shrink-0 text-[11px] text-terracotta"
                            style={{ opacity: active ? 1 : 0 }}
                          >
                            &#9654;
                          </span>
                          {c}
                        </button>
                      </li>
                    );
                  })}
                  {!countryList.length && (
                    <li className="px-2 py-3 font-pixel text-[13px] text-[#6b6e76]">
                      No match. Try &quot;Other&quot;.
                    </li>
                  )}
                </ul>
              </>
            )}

            {cur.kind === "review" && (
              <div>
                <p className="font-pixel text-[11px] tracking-[0.28em] text-[#e8a33d]">
                  FINAL CHECK
                </p>
                <h3 className="mt-4 font-pixel text-[24px] font-semibold leading-[1.2] text-cream sm:text-[30px]">
                  Ready?
                </h3>
                <dl className="mt-8 space-y-3">
                  {[
                    ["EMAIL", valueOf("email")],
                    ["SPEND", valueOf("spend")],
                    ["USING", providersSel.join(", ") || "—"],
                    ["MODELS", valueOf("models") || "—"],
                    ["COMPANY", valueOf("company") || "—"],
                    ["BASED IN", valueOf("country")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline gap-4">
                      <dt className="w-[92px] shrink-0 font-pixel text-[10px] tracking-[0.2em] text-[#8d9098]">
                        {k}
                      </dt>
                      <dd className="truncate font-pixel text-[14px] text-cream">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-8 font-pixel text-[10px] tracking-[0.22em] text-warm-gray">
                  NO SALES CALL &middot; NO COMMITMENT &middot; KEYS LIVE IN
                  HOURS
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* game-dialog footer: exit bottom-left, action bottom-right */}
      <div className="relative flex items-center justify-between border-t border-[#4a4d54]/60 px-7 py-5">
        {scorePop && (
          <span
            aria-hidden
            className="animate-score-pop pointer-events-none absolute right-16 top-0 font-pixel text-lg font-semibold text-[#e8a33d]"
          >
            +100
          </span>
        )}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onClose}
            className="font-pixel text-[11px] tracking-[0.18em] text-warm-gray transition-colors hover:text-cream focus:outline-none"
          >
            [ESC] EXIT
          </button>
          {step > 0 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="font-pixel text-[11px] tracking-[0.18em] text-warm-gray transition-colors hover:text-cream focus:outline-none"
            >
              [&#9003;] BACK
            </button>
          )}
        </div>
        {cur.kind === "review" ? (
          <button
            type="button"
            onClick={submit}
            className="relative bg-terracotta px-7 py-3 font-pixel text-[13px] font-semibold tracking-[0.14em] text-charcoal transition-colors hover:bg-terracotta-bright"
          >
            <span aria-hidden className="absolute left-0 top-0 h-1 w-1 bg-[#2a2c30]" />
            <span aria-hidden className="absolute right-0 top-0 h-1 w-1 bg-[#2a2c30]" />
            <span aria-hidden className="absolute bottom-0 left-0 h-1 w-1 bg-[#2a2c30]" />
            <span aria-hidden className="absolute bottom-0 right-0 h-1 w-1 bg-[#2a2c30]" />
            PRESS START [&#8629;]
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            disabled={!stepValid()}
            className="font-pixel text-[12px] tracking-[0.18em] text-[#e8a33d] transition-opacity focus:outline-none disabled:opacity-30"
          >
            NEXT [&#8629;]
          </button>
        )}
      </div>
    </div>
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
            className="relative w-full max-w-[680px] border-2 border-[#4a4d54] bg-[#2a2c30] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
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

            <ModalWizard onClose={() => setOpen(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
