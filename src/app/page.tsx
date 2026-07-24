import Image from "next/image";
import Reveal from "@/components/Reveal";
import RequestAccessForm from "@/components/RequestAccessForm";
import OrbitSystem from "@/components/OrbitSystem";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <Image
            src="/straitly-mark.svg"
            alt="Straitly compass logo"
            width={28}
            height={28}
            priority
          />
          <span className="font-pixel text-lg tracking-wide text-cream">
            straitly
          </span>
        </div>
        <a
          href="#access"
          className="border border-terracotta px-4 py-2 text-xs text-terracotta transition-colors hover:bg-terracotta hover:text-charcoal sm:text-sm"
        >
          Request access
        </a>
      </nav>

      <section className="flex flex-1 items-center px-6 py-12 sm:px-10">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="mb-5 font-pixel text-xs tracking-[0.25em] text-warm-gray sm:text-sm">
                ONE API &middot; EVERY FRONTIER MODEL
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="font-pixel text-4xl leading-tight text-cream sm:text-5xl lg:text-[3.4rem]">
                Wholesale API
                <br />
                <span className="text-terracotta">for Tokens</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-warm-gray sm:text-base">
                We buy in bulk so you save money. An OpenAI-compatible gateway
                to 300+ models at{" "}
                <span className="text-cream">
                  10&ndash;25% under provider list prices
                </span>
                .
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-10">
              <div id="access">
                <RequestAccessForm />
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[11px] text-warm-gray sm:text-xs">
                <span>
                  <b className="mr-1.5 font-pixel text-sm font-normal text-cream">
                    300+
                  </b>
                  models
                </span>
                <span>
                  <b className="mr-1.5 font-pixel text-sm font-normal text-cream">
                    1
                  </b>
                  key, one bill
                </span>
                <span>
                  <b className="mr-1.5 font-pixel text-sm font-normal text-cream">
                    99.9%
                  </b>
                  uptime
                </span>
                <span>
                  <b className="mr-1.5 font-pixel text-sm font-normal text-cream">
                    5 min
                  </b>
                  to migrate
                </span>
              </div>
            </Reveal>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <OrbitSystem />
          </div>
        </div>
      </section>

      <footer className="flex flex-col items-start justify-between gap-4 border-t border-warm-gray/20 px-6 py-6 text-xs text-warm-gray sm:flex-row sm:items-center sm:px-10">
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
      </footer>
    </main>
  );
}
