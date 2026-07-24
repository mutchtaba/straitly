"use client";

import { useEffect, useRef, useState } from "react";

export default function RequestAccessForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const body = new URLSearchParams({
        "form-name": "waitlist",
        email,
      }).toString();
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="font-pixel text-sm text-terracotta-bright sm:text-base">
        &gt; you&apos;re in the queue. we&apos;ll be in touch.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-13 cursor-pointer bg-terracotta px-8 py-4 text-sm font-medium text-charcoal transition-colors hover:bg-terracotta-bright"
      >
        Request access
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <input
        ref={inputRef}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        aria-label="Email address"
        className="h-13 flex-1 border border-warm-gray/40 bg-charcoal-deep px-4 py-4 text-sm text-cream placeholder:text-warm-gray focus:border-terracotta focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-13 shrink-0 cursor-pointer bg-terracotta px-6 py-4 text-sm font-medium text-charcoal transition-colors hover:bg-terracotta-bright disabled:opacity-60"
      >
        {status === "sending" ? "..." : "Join"}
      </button>
      {status === "error" && (
        <p className="text-xs text-terracotta-bright">
          something broke — try again.
        </p>
      )}
    </form>
  );
}
