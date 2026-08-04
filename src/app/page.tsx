import TheDeal from "@/components/TheDeal";
import StatBoard from "@/components/StatBoard";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import RetroTerminal from "@/components/RetroTerminal";
import { TrustedBy } from "@/components/SocialProof";
import ModelCatalog from "@/components/ModelCatalog";
import HowItWorks from "@/components/HowItWorks";
import FinalCta from "@/components/FinalCta";
import ArcadeCta from "@/components/ArcadeCta";
import Faq from "@/components/Faq";
import ApplyModal from "@/components/ApplyModal";

const CONTAINER = "mx-auto w-full max-w-[1360px] px-6";

/* one gap between any two blocks: 80 mobile / 112 tablet / 160 laptop */
const SECTION_GAP = "pt-20 md:pt-28 lg:pt-40";

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
                <p className="mt-7 whitespace-nowrap font-pixel text-[10px] tracking-[0.05em] text-[#c4beb4] sm:text-[17px] sm:tracking-[0.18em]">
                  ONE OPENAI-COMPATIBLE API &middot; EVERY FRONTIER MODEL
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-9 flex flex-wrap gap-4">
                  <ArcadeCta>See if you qualify</ArcadeCta>
                  <ArcadeCta href="#models" variant="outline">
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
                  </ArcadeCta>
                </div>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="mt-5 whitespace-nowrap font-pixel text-[9px] tracking-[0.05em] text-warm-gray sm:text-[11px] sm:tracking-[0.2em]">
                  QUALIFY AND GET $100 IN TRIAL CREDITS &middot; NO COMMITMENT
                </p>
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

      <section id="deal" className={`${SECTION_GAP} overflow-x-clip`}>
        <div className={CONTAINER}>
          <TheDeal />
        </div>
      </section>

      <section id="models" className={`${SECTION_GAP} overflow-x-clip`}>
        <div className={CONTAINER}>
          <ModelCatalog />
        </div>
      </section>

      <section id="reliability" className={`${SECTION_GAP} overflow-x-clip`}>
        <div className={CONTAINER}>
          <StatBoard />
        </div>
      </section>

      <section
        id="how-it-works"
        className={`${SECTION_GAP} overflow-x-clip`}
      >
        <div className={CONTAINER}>
          <HowItWorks />
        </div>
      </section>

      <section id="apply" className="overflow-x-clip">
        <FinalCta />
      </section>

      <section id="faq" className={`${SECTION_GAP} overflow-x-clip pb-16 md:pb-20`}>
        <div className={CONTAINER}>
          <Faq />
        </div>
      </section>

      <ApplyModal />

      <footer className="border-t border-warm-gray/15">
        <div className={CONTAINER}>
          {/* mobile: centered stack with room to breathe; desktop: same
              single row as before */}
          <div className="flex flex-col items-center justify-between gap-5 py-8 font-pixel text-xs text-warm-gray sm:flex-row sm:items-center sm:gap-4 sm:py-4">
            <span className="text-center">
              &copy; 2026 Straitly &middot; San Francisco, CA
            </span>
            <div className="flex gap-8 sm:gap-6">
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
        </div>
      </footer>
    </main>
  );
}
