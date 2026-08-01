import Image from "next/image";
import Link from "next/link";
import { TrustedBy } from "@/components/SocialProof";

const CONTAINER = "mx-auto w-full max-w-[1360px] px-6";

const VARIANTS = [
  { id: "a", label: "A · Diagnostics" },
  { id: "b", label: "B · Editorial" },
  { id: "c", label: "C · Price table" },
];

/* Preview shell for the stats-section mockups: shows the logo bar above
   each candidate so the "bar after bar" flow can be judged in context. */
export default function Shell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
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
          <div className="flex items-center gap-5 font-pixel text-xs sm:text-sm">
            {VARIANTS.map((v) => (
              <Link
                key={v.id}
                href={`/stats/${v.id}`}
                className={
                  v.id === active
                    ? "text-terracotta"
                    : "text-warm-gray transition-colors hover:text-cream"
                }
              >
                {v.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-28">
        <div className={`${CONTAINER} py-10`}>
          <TrustedBy />
        </div>

        <section className="border-y border-warm-gray/10 py-24 sm:py-28">
          <div className={CONTAINER}>{children}</div>
        </section>

        <p className="py-10 text-center font-pixel text-xs text-warm-gray">
          MOCKUP &middot; STATS SECTION CANDIDATE {active.toUpperCase()}
        </p>
      </div>
    </main>
  );
}
