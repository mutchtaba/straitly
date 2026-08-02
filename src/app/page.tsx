import TheDeal from "@/components/TheDeal";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import RetroTerminal from "@/components/RetroTerminal";
import { TrustedBy } from "@/components/SocialProof";

const CONTAINER = "mx-auto w-full max-w-[1360px] px-6";

/* one gap between any two blocks: 64 mobile / 96 tablet / 128 laptop */
const SECTION_GAP = "pt-16 md:pt-24 lg:pt-32";
const SECTION_BOTTOM = "pb-16 md:pb-24 lg:pb-32";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      <section id="access" className="overflow-x-clip pt-14">
        <div className={`${CONTAINER} ${SECTION_GAP}`}>
          <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-12">
            <div>
              <Reveal>
                <h1 className="font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-6xl xl:text-[80px]">
                  A unified interface
                  <br />
                  <span className="text-terracotta">for LLMs</span>
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-7 font-pixel text-sm tracking-[0.18em] text-[#c4beb4] sm:text-[17px]">
                  ONE OPENAI-COMPATIBLE API &middot; EVERY FRONTIER MODEL
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-9 flex flex-wrap gap-4">
                  <a
                    href="#access"
                    className="bg-terracotta px-7 py-3.5 text-[15px] font-medium text-charcoal transition-colors hover:bg-terracotta-bright"
                  >
                    See if you qualify
                  </a>
                  <a
                    href="#models"
                    className="flex items-center gap-2.5 border border-warm-gray/40 px-7 py-3.5 text-[15px] text-cream transition-colors hover:border-cream"
                  >
                    <svg
                      aria-hidden
                      width="13"
                      height="13"
                      viewBox="0 0 14 14"
                      fill="currentColor"
                    >
                      <rect x="0" y="0" width="6" height="6" />
                      <rect x="8" y="0" width="6" height="6" />
                      <rect x="0" y="8" width="6" height="6" />
                      <rect x="8" y="8" width="6" height="6" />
                    </svg>
                    Explore models
                  </a>
                </div>
              </Reveal>
            </div>

            <div className="hidden items-center justify-end lg:flex">
              <div className="w-full max-w-[640px]">
                <RetroTerminal
                  src="/retro/03-phosphor-terminal-cut.png"
                  alt="Retro terminal showing the Straitly API"
                  screen={{
                    left: 25.45,
                    top: 13.73,
                    width: 49.19,
                    height: 42.24,
                  }}
                  tabsTop={68.81}
                  tabsSpan={{ left: 15.66, width: 68.59 }}
                  imgWidth={1045}
                  imgHeight={947}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Spacing system: every block owns only its TOP gap (SECTION_GAP),
            so gaps never stack. The last section before the footer also
            takes SECTION_BOTTOM. */}
        <div className={`${CONTAINER} ${SECTION_GAP}`}>
          <Reveal delay={0.3}>
            <TrustedBy />
          </Reveal>
        </div>
      </section>

      <section
        id="deal"
        className={`${SECTION_GAP} ${SECTION_BOTTOM} overflow-x-clip`}
      >
        <div className={CONTAINER}>
          <TheDeal />
        </div>
      </section>

      <footer className="border-t border-warm-gray/15">
        <div
          className={`${CONTAINER} flex flex-col items-start justify-between gap-4 py-6 font-pixel text-xs text-warm-gray sm:flex-row sm:items-center`}
        >
          <span>&copy; 2026 Straitly &middot; San Francisco, CA</span>
          <div className="flex gap-6">
            <a
              href="https://x.com/straitly"
              className="transition-colors hover:text-cream"
            >
              X
            </a>
            <a
              href="https://linkedin.com/company/straitly"
              className="transition-colors hover:text-cream"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
