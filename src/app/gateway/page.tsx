import { GatewayDiagram } from "@/components/GatewayDiagram";

const COMBOS = [
  { id: "A", app: "window", center: "router" },
  { id: "B", app: "window", center: "tower" },
  { id: "C", app: "terminal", center: "router" },
  { id: "D", app: "terminal", center: "tower" },
] as const;

export default function GatewayPreview() {
  return (
    <main className="min-h-screen bg-[#313338] px-6 py-16">
      <h1 className="mb-2 text-center font-pixel text-sm tracking-[0.3em] text-[#F0EBE2]">
        GATEWAY DIAGRAM — 4 COMBOS
      </h1>
      <p className="mb-14 text-center text-sm text-[#c4beb4]">
        A: window + router · B: window + tower · C: terminal + router · D:
        terminal + tower
      </p>
      <div className="flex flex-col gap-24">
        {COMBOS.map((c) => (
          <section key={c.id} id={c.id}>
            <p className="mb-6 text-center font-pixel text-xs tracking-[0.3em] text-[#33ff66]">
              OPTION {c.id}
            </p>
            <GatewayDiagram app={c.app} center={c.center} />
            <div className="h-8" />
          </section>
        ))}
      </div>
    </main>
  );
}
