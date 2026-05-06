---
status: partial
phase: 01-scroll-foundation
source: [01-VERIFICATION.md]
started: 2026-05-06T12:00:00Z
updated: 2026-05-06T12:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Lenis smooth scroll feel + HUD live updates
expected: Run `npm run dev`, scroll the page — ScrollDebugHUD shows all 5 fields (progress, velocity, displayVelocity, phase, lenis) updating in real time
result: [pending]

### 2. Phase boundary transitions
expected: HUD `phase` field changes `vertical → transition → horizontal` at approximately 40% and 55% scroll depth
result: [pending]

### 3. Horizontal pin + scrub
expected: Section pins at ~55% scroll progress, inner track slides leftward, no stutter at pin entry or exit
result: [pending]

### 4. No duplicate GSAP registration warnings
expected: Browser DevTools Console shows zero "GSAP plugin already registered" warnings after full page load and scroll
result: [pending]

### 5. ScrollTrigger markers align with visual section
expected: GSAP ScrollTrigger start/end markers (visible in dev) align with the horizontal section boundaries (confirms Lenis+GSAP sync — FOUND-04)
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
