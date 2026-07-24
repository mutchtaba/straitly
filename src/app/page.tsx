import Image from "next/image";
import Reveal from "@/components/Reveal";
import RequestAccessForm from "@/components/RequestAccessForm";
import OrbitSystem from "@/components/OrbitSystem";

const CONTAINER = "mx-auto w-full max-w-[1280px] px-5 sm:px-6";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav>
        <div className={`${CONTAINER} flex items-center justify-between py-4`}>
          <div className="flex items-center gap-3">
            <Image
              src="/straitly-mark.svg"
              alt="Straitly compass logo"
              width={26}
              height={26}
              priority
            />
            <span className="font-pixel text-2xl font-bold tracking-wide text-cream">
              straitly
            </span>
          </div>
          <a
            href="#access"
            className="border border-terracotta px-4 py-2 text-xs text-terracotta transition-colors hover:bg-terracotta hover:text-charcoal sm:text-sm"
          >
            Request access
          </a>
        </div>
      </nav>

      <section className="flex flex-1 items-center overflow-x-clip">
        <div
          className={`${CONTAINER} grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]`}
        >
          <div>
            <Reveal>
              <p className="mb-6 font-pixel text-xs tracking-[0.25em] text-warm-gray sm:text-sm">
                ONE API &middot; EVERY FRONTIER MODEL
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="font-display text-6xl font-semibold leading-[1.0] text-cream sm:text-7xl xl:text-[92px]">
                <span className="whitespace-nowrap">Wholesale API</span>
                <br />
                <span className="text-terracotta">for Tokens</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-md font-pixel text-base leading-relaxed text-warm-gray sm:text-lg">
                We buy in bulk so you save money.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-10">
              <div id="access">
                <RequestAccessForm />
              </div>
            </Reveal>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <OrbitSystem />
          </div>
        </div>
      </section>

      <footer className="border-t border-warm-gray/15">
        <div
          className={`${CONTAINER} flex flex-col items-start justify-between gap-4 py-6 text-xs text-warm-gray sm:flex-row sm:items-center`}
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
