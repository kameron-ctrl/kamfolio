/**
 * Phase 1 demo page (D-13).
 *
 * Server Component. Renders a tall vertical spacer above HorizontalTrack
 * so the document is tall enough for the D-09 phase boundaries
 * (vertical 0-40%, transition 40-55%, horizontal 55-100%) to align with
 * the visual geometry of the pin trigger.
 *
 * Sizing:
 *   - Vertical spacer: 250vh
 *   - HorizontalTrack inner width: 3 × 100vw = 300vw → 200vw of horizontal travel
 *   - GSAP pin adds a 200vh pinSpacer for the duration of the scrub
 *   - Total document height: ~450vh; pin engages at ~250vh / ~450vh ≈ 55% ✓
 *
 * Placeholder visual (D-13): three full-viewport panels with distinct
 * background colors and labels so pin + translateX motion is obvious.
 * Real card content arrives in Phase 5.
 */
import HorizontalTrack from "@/components/horizontal-track/HorizontalTrack";

const PLACEHOLDER_SLOTS: ReadonlyArray<{ bg: string; label: string }> = [
  { bg: "#1a1a3e", label: "Placeholder 1" },
  { bg: "#1a2e3e", label: "Placeholder 2" },
  { bg: "#2e1a3e", label: "Placeholder 3" },
];

export default function Page(): JSX.Element {
  return (
    <main>
      {/* Vertical zone — represents future hero + nebula content */}
      <section
        style={{ minHeight: "250vh" }}
        data-testid="vertical-zone"
      />

      {/* Horizontal zone — pin + scrub */}
      <HorizontalTrack>
        {PLACEHOLDER_SLOTS.map((slot, i) => (
          <div
            key={slot.label}
            style={{
              width: "100vw",
              height: "100vh",
              flexShrink: 0,
              background: slot.bg,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "2.5rem",
              letterSpacing: "0.1em",
            }}
            data-testid={`horizontal-slot-${i}`}
          >
            {slot.label}
          </div>
        ))}
      </HorizontalTrack>

      {/* Trailing spacer — small buffer at end of pin so scroll doesn't end abruptly */}
      <section
        style={{
          minHeight: "20vh",
          background: "#0a0a1a",
        }}
        data-testid="trailing-spacer"
      />
    </main>
  );
}
