# Phase 4: Hero Section — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 04-hero-section
**Areas discussed:** Font choice, Animation sequencing, Subtitle text + post-type behavior, Grain overlay treatment

---

## Font Choice

| Option | Description | Selected |
|--------|-------------|----------|
| High-contrast serif | Editorial, luxury feel — Cormorant Garamond, Playfair Display, DM Serif Display | |
| Thin geometric sans | Space-age, modern — Geist, Space Grotesk, Neue Montreal Light | ✓ |
| Monospace | Codes-as-aesthetic — JetBrains Mono, IBM Plex Mono | |

**Specific font:** Geist (from options: Geist, Space Grotesk, Syne)
**Subtitle font:** Geist Mono (paired sibling)
**Weight:** 200–300 (ExtraLight–Light)

---

## Animation Sequencing

| Option | Description | Selected |
|--------|-------------|----------|
| After moon arrives (~2.5s delay) | Name waits for moon to settle | |
| Overlapping start (~1.2–1.5s delay) | Name fades in while moon approaches, both arrive at ~2.5s | ✓ |
| Immediate (no delay) | Name starts at t=0 | |

**Name fade duration:** ~1.5–2s (finishes at ~3–3.5s after mount)

**Subtitle start trigger:** After name fully visible (opacity = 1) — not overlapping

**Scroll behavior:** Static — name and subtitle stay visible throughout vertical zone

---

## Subtitle Text + Post-Type Behavior

**Subtitle text:** "Full-stack developer & creative technologist"
**Typing speed:** ~50–70ms per character (Measured)

| Option | Description | Selected |
|--------|-------------|----------|
| Blinking cursor stays | Cursor blinks indefinitely | |
| Cursor fades out after ~2s | Cursor appears, then fades, leaving just the text | ✓ |
| Nothing | Text sits there after typing | |

**Implementation:** Custom useTypewriter hook (useState + useEffect + setTimeout)

---

## Grain Overlay Treatment

**Character:** Animated film grain — shifts every ~80–120ms via CSS @keyframes

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle (~0.04–0.07 opacity) | Felt rather than seen | ✓ |
| Visible (~0.12–0.18 opacity) | Clearly intentional stylistic choice | |

**Scope:** Full page — fixed-position `::after` on body

**Implementation:** Inline SVG feTurbulence as `data:` URI in background-image

---

## Claude's Discretion

- Exact letter-spacing for name
- Exact font size for name
- feTurbulence baseFrequency
- Cursor character shape
- Name fade: CSS transition vs GSAP

## Deferred Ideas

None — discussion stayed within phase scope.
