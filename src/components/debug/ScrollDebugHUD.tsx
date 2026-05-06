"use client";

/**
 * Development-only scroll-state HUD (D-14).
 *
 * Renders only when `process.env.NODE_ENV === 'development'`. Next.js inlines
 * this constant at build time → the entire component is tree-shaken in
 * production builds (zero runtime cost, zero info leakage).
 *
 * Uses React selector subscriptions (legitimate for a UI display component) —
 * R3F components MUST use getState() inside useFrame instead.
 */
import { useScrollStore } from "@/lib/scroll-store";

export default function ScrollDebugHUD(): JSX.Element | null {
  // Hooks must be called unconditionally (Rules of Hooks).
  // process.env.NODE_ENV is a build-time constant — Next.js tree-shakes
  // the rendered output in production even though hooks are always called.
  const scrollY = useScrollStore((s) => s.scrollY);
  const velocity = useScrollStore((s) => s.velocity);
  const displayVelocity = useScrollStore((s) => s.displayVelocity);
  const phase = useScrollStore((s) => s.phase);
  const progress = useScrollStore((s) => s.progress);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        color: "#00ff88",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        padding: "8px 12px",
        borderRadius: 4,
        pointerEvents: "none",
        lineHeight: 1.8,
        minWidth: 200,
        border: "1px solid rgba(0,255,136,0.25)",
      }}
      aria-hidden="true"
      data-testid="scroll-debug-hud"
    >
      <div>scrollY: {scrollY.toFixed(1)}</div>
      <div>velocity: {velocity.toFixed(3)}</div>
      <div>displayVelocity: {displayVelocity.toFixed(3)}</div>
      <div>phase: {phase}</div>
      <div>progress: {(progress * 100).toFixed(1)}%</div>
    </div>
  );
}
