"use client";

import { useEffect, useState } from "react";

const MODELS = [
  "anthropic/fable-5",
  "openai/gpt-sol-5.6",
  "google/gemini-3.5-flash",
  "xai/grok-4.6",
];

const TYPE_MS = 120;
const DELETE_MS = 80;
const HOLD_MS = 2600;

function useTypewriter(words: string[]) {
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // All state lives in plain variables — setText only displays the result.
    // (Scheduling inside a setState updater spawns duplicate timer chains,
    // because React may invoke updaters more than once.)
    let timer: ReturnType<typeof setTimeout>;
    let word = 0;
    let len = words[0].length;
    let deleting = true;

    const tick = () => {
      if (document.hidden) {
        // paused while tab is in background; resume cleanly on return
        timer = setTimeout(tick, 500);
        return;
      }
      if (deleting) {
        len -= 1;
        setText(words[word].slice(0, len));
        if (len === 0) {
          deleting = false;
          word = (word + 1) % words.length;
        }
        timer = setTimeout(tick, len === 0 ? TYPE_MS : DELETE_MS);
      } else {
        len += 1;
        setText(words[word].slice(0, len));
        if (len === words[word].length) {
          deleting = true;
          timer = setTimeout(tick, HOLD_MS);
        } else {
          timer = setTimeout(tick, TYPE_MS);
        }
      }
    };

    timer = setTimeout(tick, HOLD_MS);
    return () => clearTimeout(timer);
  }, [words]);

  return text;
}

/* palette for hand-rolled syntax highlighting */
const kw = "text-terracotta-bright";
const str = "text-[#a8b78a]";
const fn = "text-cream";
const dim = "text-warm-gray";

export default function CodeShowcase() {
  const model = useTypewriter(MODELS);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-warm-gray/20 bg-[#232529] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-warm-gray/15 bg-[#2c2e33] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[11px] text-warm-gray">chat.tsx</span>
      </div>

      {/* code */}
      <pre className="p-5 font-mono text-[12px] leading-[1.9] sm:text-[13px]">
        <code>
          <span className={kw}>const</span> <span className={fn}>client</span>{" "}
          <span className={dim}>=</span> <span className={kw}>new</span>{" "}
          <span className={fn}>OpenAI</span>
          <span className={dim}>({"{"}</span>
          {"\n  "}
          <span className={fn}>baseURL</span>
          <span className={dim}>:</span>{" "}
          <span className={str}>&quot;https://api.straitly.ai/v1&quot;</span>
          <span className={dim}>,</span>
          {"\n"}
          <span className={dim}>{"})"};</span>
          {"\n\n"}
          <span className={kw}>const</span> <span className={fn}>res</span>{" "}
          <span className={dim}>=</span> <span className={kw}>await</span>{" "}
          <span className={fn}>client.chat.completions.create</span>
          <span className={dim}>({"{"}</span>
          {"\n  "}
          <span className={fn}>model</span>
          <span className={dim}>:</span>{" "}
          <span className="rounded bg-terracotta/15 px-1 py-0.5">
            <span className={str}>&quot;{model}</span>
            <span className="animate-caret -mb-0.5 inline-block h-4 w-[7px] bg-terracotta align-middle" />
            <span className={str}>&quot;</span>
          </span>
          <span className={dim}>,</span>
          {"\n  "}
          <span className={fn}>messages</span>
          <span className={dim}>:</span> <span className={dim}>[{"{"}</span>{" "}
          <span className={fn}>role</span>
          <span className={dim}>:</span>{" "}
          <span className={str}>&quot;user&quot;</span>
          <span className={dim}>,</span>
          {"\n    "}
          <span className={fn}>content</span>
          <span className={dim}>:</span>{" "}
          <span className={str}>
            &quot;Why didn&apos;t I switch sooner?&quot;
          </span>{" "}
          <span className={dim}>{"}]"},</span>
          {"\n"}
          <span className={dim}>{"})"};</span>
        </code>
      </pre>
    </div>
  );
}
