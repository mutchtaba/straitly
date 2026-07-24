import Image from "next/image";
import Reveal from "@/components/Reveal";
import OrbitSystem from "@/components/OrbitSystem";
import CodeShowcase from "@/components/CodeShowcase";
import { TrustedBy, SavingsCounter } from "@/components/SocialProof";

const CONTAINER = "mx-auto w-full max-w-[1360px] px-6";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="fixed inset-x-0 top-0 z-50 bg-charcoal/80 backdrop-blur-md">
        <div className={`${CONTAINER} flex items-center justify-between py-4`}>
          <div className="flex items-center gap-3">
            <Image
              src="/straitly-mark.svg"
              alt="Straitly compass logo"
              width={34}
              height={34}
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

      <section className="flex min-h-screen items-center overflow-x-clip pt-16">
        <div
          className={`${CONTAINER} grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]`}
        >
          <div>
            <Reveal>
              <h1 className="font-display text-6xl font-semibold leading-[1.0] text-cream sm:text-7xl xl:text-[92px]">
                <span className="whitespace-nowrap">Wholesale API</span>
                <br />
                <span className="text-terracotta">for Tokens</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-7 font-pixel text-base tracking-[0.18em] text-warm-gray sm:text-lg">
                ONE API &middot; EVERY FRONTIER MODEL
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-10">
              <div id="access">
                <CodeShowcase />
              </div>
            </Reveal>
          </div>

          <div className="hidden items-center justify-center lg:flex lg:translate-x-6">
            <OrbitSystem />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className={CONTAINER}>
          <TrustedBy />
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center">
        <div className={CONTAINER}>
          <SavingsCounter />
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
