import Image from "next/image";
import Reveal from "@/components/Reveal";
import RequestAccessForm from "@/components/RequestAccessForm";
import PixelDiscount from "@/components/PixelDiscount";

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

      <section className="flex flex-1 items-center px-6 py-16 sm:px-10">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="mb-5 font-pixel text-xs tracking-[0.25em] text-warm-gray sm:text-sm">
                BULK PRICING FOR AI INFERENCE
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="font-pixel text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">
                Every model.
                <br />
                <span className="text-terracotta">Below list price.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-warm-gray sm:text-base">
                One API for 300+ models at 10&ndash;25% under provider prices.
                We pool demand, buy in bulk, and pass the discount to you.
                <span className="text-cream"> Costco for tokens.</span>
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-10" >
              <div id="access">
                <RequestAccessForm />
              </div>
            </Reveal>
          </div>

          <div className="hidden justify-end lg:flex">
            <PixelDiscount />
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
