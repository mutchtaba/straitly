import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import RetroTerminal from "@/components/RetroTerminal";
import { TrustedBy } from "@/components/SocialProof";
import DealCompare from "@/components/DealCompare";

const CONTAINER = "mx-auto w-full max-w-[1360px] px-6";

/* Alternate hero version: painted vintage Macintosh (option 6),
   cream-themed language bar. Compare against / (option 3). */
export default function MacVersion() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      <section
        id="access"
        className="flex min-h-screen items-center overflow-x-clip pt-16"
      >
        <div className={`${CONTAINER} py-10`}>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]">
            <div>
              <Reveal>
                <h1 className="font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-6xl xl:text-[76px]">
                  The LLM Router
                  <br />
                  <span className="text-terracotta">for Serious Devs</span>
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-7 font-pixel text-base tracking-[0.18em] text-[#c4beb4] sm:text-lg">
                  ONE ENDPOINT &middot; EVERY MODEL
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-9 flex flex-wrap gap-4">
                  <a
                    href="#access"
                    className="bg-terracotta px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-terracotta-bright"
                  >
                    Request access
                  </a>
                  <a
                    href="#models"
                    className="flex items-center gap-2.5 border border-warm-gray/40 px-6 py-3 text-sm text-cream transition-colors hover:border-cream"
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

            <div className="hidden items-center justify-center lg:flex">
              <div className="w-full max-w-[700px]">
                <RetroTerminal
                  src="/retro/06-macintosh-painted-crop.png"
                  alt="Vintage Macintosh showing the Straitly API"
                  screen={{
                    left: 18.56,
                    top: 17.15,
                    width: 63.03,
                    height: 44.06,
                  }}
                  tabsTop={80}
                  barTheme="cream"
                />
              </div>
            </div>
          </div>

          <Reveal delay={0.3} className="mt-16">
            <TrustedBy />
          </Reveal>
        </div>
      </section>

      <section id="models" className="py-32 sm:py-44">
        <div className={CONTAINER}>
          <DealCompare />
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
