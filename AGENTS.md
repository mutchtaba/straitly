<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Straitly design rules (permanent)

- **Text color on charcoal**: Body/subtitle copy must always use the bright warm tone `#c4beb4` (or brighter `text-cream`) — NEVER the dim `text-warm-gray` or any low-contrast gray on the dark charcoal background. `warm-gray` is only allowed for tiny meta text (footer, timestamps).
- **Section visuals**: Never reuse the same hero visual style (green CRT phosphor screen) in other sections. Each section gets its own distinct visual concept and a layout different from the section above it.
- **Spacing**: Sections only own their TOP gap (`pt-16 md:pt-24 lg:pt-32`); the last section before the footer also takes the bottom padding. Gaps never stack.
