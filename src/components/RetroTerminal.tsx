"use client";

import Image from "next/image";
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

    let timer: ReturnType<typeof setTimeout>;
    let word = 0;
    let len = words[0].length;
    let deleting = true;

    const tick = () => {
      if (document.hidden) {
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

export type ScreenRect = {
  /** all values are % of the full image */
  left: number;
  top: number;
  width: number;
  height: number;
};

/* phosphor palette */
const G_BRIGHT = "#66ff99";
const G_MAIN = "#33e06a";
const G_DIM = "#1c8f44";

/* layout constants used to auto-fit the type inside any screen rect */
const MAX_CHARS = 33; // longest rendered line
const LINE_COUNT = 13;
const LINE_HEIGHT = 1.55;
const CHAR_W = 0.62; // monospace advance width in em
const PAD_FRAC = 0.07; // padding inside the glass, each side
const IMG_ASPECT = 1024 / 1280; // height/width of the generated images

const LANGS = ["curl", "python", "js"] as const;
type Lang = (typeof LANGS)[number];

/* bar color themes: dark machines vs cream/off-white machines */
const BAR_THEMES = {
  dark: {
    barBg: "rgba(48, 52, 59, 0.9)",
    barBorder: "rgba(74, 78, 87, 0.8)",
    idleText: "#c9c3b9",
    activeText: G_BRIGHT,
    activeBg: "rgba(51, 224, 106, 0.08)",
    activeBorder: "rgba(102, 255, 153, 0.7)",
    glow: true,
  },
  cream: {
    barBg: "rgba(236, 230, 219, 0.92)",
    barBorder: "rgba(130, 124, 112, 0.7)",
    idleText: "#6b665c",
    activeText: "#0e7a33",
    activeBg: "rgba(14, 122, 51, 0.08)",
    activeBorder: "rgba(14, 122, 51, 0.55)",
    glow: false,
  },
} as const;
export type BarTheme = keyof typeof BAR_THEMES;

function Caret({ fontCqw }: { fontCqw: number }) {
  return (
    <span
      className="animate-caret inline-block align-middle"
      style={{
        width: `${fontCqw * CHAR_W}cqw`,
        height: `${fontCqw}cqw`,
        background: G_BRIGHT,
        boxShadow: `0 0 ${fontCqw * 0.6}cqw rgba(102,255,153,0.8)`,
      }}
    />
  );
}

function Snippet({
  lang,
  model,
  fontCqw,
}: {
  lang: Lang;
  model: string;
  fontCqw: number;
}) {
  const b = { color: G_BRIGHT };
  const d = { color: G_DIM };
  const modelSpan = (
    <span style={b}>
      &quot;{model}
      <Caret fontCqw={fontCqw} />
      &quot;
    </span>
  );

  if (lang === "curl") {
    return (
      <code>
        <span style={d}># straitly · chat completions</span>
        {"\n"}
        <span style={b}>$</span> curl \{"\n"}
        {"  "}api.straitly.ai/v1/chat/\{"\n"}
        completions \{"\n"}
        {"  "}-H <span style={d}>&quot;authorization: bearer</span>
        {"\n"}
        {"      "}
        <span style={d}>$STRAITLY_KEY&quot;</span> \{"\n"}
        {"  "}-d &#39;{"{"}
        {"\n"}
        {"    "}&quot;model&quot;:{"\n"}
        {"      "}
        {modelSpan},{"\n"}
        {"    "}&quot;messages&quot;: [{"{"}
        {"\n"}
        {"      "}&quot;role&quot;: &quot;user&quot;,{"\n"}
        {"      "}&quot;content&quot;: &quot;hello&quot; {"}"}]{"\n"}
        {"  "}
        {"}"}&#39;
      </code>
    );
  }

  if (lang === "python") {
    return (
      <code>
        <span style={d}># straitly · chat completions</span>
        {"\n"}
        <span style={b}>from</span> openai <span style={b}>import</span> OpenAI
        {"\n\n"}
        client = OpenAI(base_url={"\n"}
        {"  "}&quot;https://api.straitly.ai/v1&quot;){"\n\n"}
        res = client.chat.completions{"\n"}
        {"  "}.create({"\n"}
        {"    "}model={"\n"}
        {"      "}
        {modelSpan},{"\n"}
        {"    "}messages=[{"{"}&quot;role&quot;: &quot;user&quot;,{"\n"}
        {"      "}&quot;content&quot;: &quot;hello&quot;{"}"}]){"\n"}
        <Caret fontCqw={fontCqw} />
      </code>
    );
  }

  return (
    <code>
      <span style={d}>{"//"} straitly · chat completions</span>
      {"\n"}
      <span style={b}>const</span> client = <span style={b}>new</span> OpenAI(
      {"{"}
      {"\n"}
      {"  "}baseURL:{"\n"}
      {"    "}&quot;https://api.straitly.ai/v1&quot;{"\n"}
      {"}"});{"\n\n"}
      <span style={b}>const</span> res = <span style={b}>await</span>{" "}
      client.chat{"\n"}
      {"  "}.completions.create({"{"}
      {"\n"}
      {"    "}model:{"\n"}
      {"      "}
      {modelSpan},{"\n"}
      {"    "}messages: [{"{"} role: &quot;user&quot;,{"\n"}
      {"      "}content: &quot;hello&quot; {"}"}]{"\n"}
      {"}"});
    </code>
  );
}

export default function RetroTerminal({
  src,
  alt,
  screen,
  tabsTop,
  tabsSpan,
  barTheme = "dark",
}: {
  src: string;
  alt: string;
  screen: ScreenRect;
  /** vertical center of the language buttons, % of image height.
      Defaults to just under the glass. */
  tabsTop?: number;
  /** horizontal span of the button bar, % of image width.
      Defaults to slightly wider than the glass. */
  tabsSpan?: { left: number; width: number };
  /** bar colors: "dark" for charcoal machines, "cream" for beige ones */
  barTheme?: BarTheme;
}) {
  const theme = BAR_THEMES[barTheme];
  const model = useTypewriter(MODELS);
  const [lang, setLang] = useState<Lang>("python");

  // Font size in cqw (1cqw = 1% of the image width). Fit both axes:
  const usable = 1 - PAD_FRAC * 2;
  const fitWidth = (screen.width * usable) / (MAX_CHARS * CHAR_W);
  const fitHeight =
    (screen.height * IMG_ASPECT * usable) / (LINE_COUNT * LINE_HEIGHT);
  const fontCqw = Math.min(fitWidth, fitHeight);
  const btnFont = Math.max(screen.width * 0.032, 1.05);

  return (
    <div className="relative w-full" style={{ containerType: "inline-size" }}>
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={1024}
        priority
        className="h-auto w-full select-none"
      />

      {/* the glass */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${screen.left}%`,
          top: `${screen.top}%`,
          width: `${screen.width}%`,
          height: `${screen.height}%`,
          borderRadius: "4% / 5%",
          background:
            "radial-gradient(ellipse at 50% 45%, #0d1810 0%, #08100a 70%, #050a06 100%)",
          boxShadow: "inset 0 0 3cqw rgba(51, 224, 106, 0.18)",
        }}
      >
        <pre
          className="h-full w-full overflow-hidden font-pixel"
          style={{
            fontSize: `${fontCqw}cqw`,
            lineHeight: LINE_HEIGHT,
            padding: `${screen.width * PAD_FRAC}cqw`,
            color: G_MAIN,
            textShadow: `0 0 ${fontCqw * 0.5}cqw rgba(102, 255, 153, 0.55)`,
          }}
        >
          <Snippet lang={lang} model={model} fontCqw={fontCqw} />
        </pre>

        {/* scanlines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* curved-glass sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(240,235,226,0.07) 0%, transparent 45%)",
          }}
        />
      </div>

      {/* language switcher: one control bar covering the machine's LED
          strip, with the buttons inside it */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: `${tabsSpan ? tabsSpan.left : screen.left - 2.5}%`,
          width: `${tabsSpan ? tabsSpan.width : screen.width + 5}%`,
          top: `${tabsTop ?? screen.top + screen.height + 3.5}%`,
          transform: "translateY(-50%)",
          gap: "3cqw",
          padding: "0.35cqw 1.6cqw",
          background: theme.barBg,
          backdropFilter: "blur(4px)",
          border: `1px solid ${theme.barBorder}`,
          borderRadius: "0.7cqw",
          boxShadow: "0 0.4cqw 1.6cqw rgba(0,0,0,0.45)",
        }}
      >
        {LANGS.map((l) => {
          const active = l === lang;
          return (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className="flex cursor-pointer items-center font-pixel uppercase transition-colors"
              style={{
                fontSize: `${btnFont}cqw`,
                letterSpacing: "0.12em",
                gap: `${btnFont * 0.55}cqw`,
                padding: `${btnFont * 0.25}cqw ${btnFont * 1.1}cqw`,
                borderRadius: `${btnFont * 0.5}cqw`,
                background: active ? theme.activeBg : "transparent",
                border: `1px solid ${active ? theme.activeBorder : "transparent"}`,
                color: active ? theme.activeText : theme.idleText,
                textShadow:
                  active && theme.glow
                    ? "0 0 0.8cqw rgba(102,255,153,0.7)"
                    : "none",
                boxShadow:
                  active && theme.glow
                    ? "0 0 1.2cqw rgba(102,255,153,0.25)"
                    : "none",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: `${btnFont * 0.6}cqw`,
                  height: `${btnFont * 0.6}cqw`,
                  borderRadius: "50%",
                  background: active ? G_BRIGHT : "#B77F5A",
                  boxShadow: active
                    ? "0 0 1cqw rgba(102,255,153,0.9)"
                    : "0 0 0.6cqw rgba(183,127,90,0.6)",
                }}
              />
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
