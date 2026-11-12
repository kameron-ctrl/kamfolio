"use client";

/**
 * Homelab card media: a schematic of one agent job. The task chip lands, a packet
 * runs Telegram → router, the router scores each agent, the winner lights up, the
 * packet follows its branch line, and the result chip fades in.
 * Only transform and opacity animate. Reduced motion shows the finished state.
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { PIPELINE } from "@/content/projects";

const MEDIA_FRAME =
  "relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-[var(--color-hairline)]";
const CHIP =
  "absolute left-4 flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--color-hairline)] bg-[rgba(8,8,10,0.72)] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.06em] text-[var(--color-silver)] opacity-0 backdrop-blur";

// Schematic geometry, in viewBox units (400 × 300)
const MID_Y = 150;
const PHONE = { x: 24, w: 84, h: 44 };
const ROUTER = { x: 150, w: 84, h: 44 };
const AGENT = { x: 276, w: 104, h: 32 };
const ELBOW_X = 255;
const AGENT_CENTERS = [102, 150, 198] as const;

const TASK_IN = 0.4;
const HOP = 0.45;
const SCORE_STAGGER = 0.12;
const RESULT_IN = 0.5;

interface AgentPipelineProps {
  revealed: boolean;
}

const LABEL = `Diagram: a task sent from Telegram reaches a router, which scores ${PIPELINE.agents
  .map((a) => a.name)
  .join(", ")} and hands the job to ${PIPELINE.agents[PIPELINE.chosen].name}. The job finishes on its own branch with tests passing.`;

export default function AgentPipeline({ revealed }: AgentPipelineProps): JSX.Element {
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = frameRef.current;
      if (!revealed || !frame) return;
      const q = gsap.utils.selector(frame);
      const [task, result, packet, routerGlow, chosen] = [
        "task",
        "result",
        "packet",
        "router-glow",
        "chosen",
      ].map((part) => q(`[data-part='${part}']`));
      const scores = q("[data-part='score']");

      if (prefersReducedMotion()) {
        gsap.set([task, result, chosen, ...scores], { opacity: 1, y: 0 });
        return;
      }

      const chosenY = AGENT_CENTERS[PIPELINE.chosen] - MID_Y;
      const start = ROUTER.x + ROUTER.w - (PHONE.x + PHONE.w);
      gsap
        .timeline()
        .to(task, { opacity: 1, y: 0, duration: TASK_IN, ease: "power2.out" })
        .set(packet, { opacity: 1, x: 0, y: 0 })
        .to(packet, { x: ROUTER.x - (PHONE.x + PHONE.w), duration: HOP, ease: "power1.in" })
        .set(packet, { opacity: 0 })
        .to(routerGlow, { opacity: 1, duration: 0.2 })
        .to(scores, { opacity: 1, duration: 0.25, stagger: SCORE_STAGGER })
        .to(chosen, { opacity: 1, duration: 0.25 })
        .to(routerGlow, { opacity: 0.35, duration: 0.3 }, "<")
        .set(packet, { opacity: 1, x: start, y: 0 })
        .to(packet, { x: ELBOW_X - (PHONE.x + PHONE.w), duration: HOP / 2, ease: "none" })
        .to(packet, { y: chosenY, duration: HOP / 2, ease: "none" })
        .to(packet, { x: AGENT.x - (PHONE.x + PHONE.w), duration: HOP / 2, ease: "power1.out" })
        .to(packet, { opacity: 0, duration: 0.2 })
        .to(result, { opacity: 1, y: 0, duration: RESULT_IN, ease: "power2.out" });
    },
    { dependencies: [revealed], scope: frameRef }
  );

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={LABEL}
      className={`${MEDIA_FRAME} bg-[radial-gradient(circle_at_60%_50%,rgba(46,196,182,0.06),transparent_65%)]`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full font-[family-name:var(--font-geist-mono)]"
      >
        <g className="fill-none stroke-[var(--color-hairline)]" strokeWidth={1}>
          <path d={`M${PHONE.x + PHONE.w},${MID_Y} H${ROUTER.x}`} />
          {AGENT_CENTERS.map((cy) => (
            <path key={cy} d={`M${ROUTER.x + ROUTER.w},${MID_Y} H${ELBOW_X} V${cy} H${AGENT.x}`} />
          ))}
        </g>

        <Node x={PHONE.x} cy={MID_Y} w={PHONE.w} h={PHONE.h} label="TELEGRAM" />
        <Node x={ROUTER.x} cy={MID_Y} w={ROUTER.w} h={ROUTER.h} label="ROUTER" />
        <rect
          data-part="router-glow"
          x={ROUTER.x}
          y={MID_Y - ROUTER.h / 2}
          width={ROUTER.w}
          height={ROUTER.h}
          rx={3}
          className="fill-none stroke-[var(--color-nebula-teal)]"
          style={{ opacity: 0 }}
        />

        {PIPELINE.agents.map((agent, i) => (
          <g key={agent.name}>
            <Node x={AGENT.x} cy={AGENT_CENTERS[i]} w={AGENT.w} h={AGENT.h} label={agent.name.toUpperCase()} align="start" />
            <text
              data-part="score"
              x={AGENT.x + AGENT.w - 10}
              y={AGENT_CENTERS[i] + 3.5}
              textAnchor="end"
              className={i === PIPELINE.chosen ? "fill-[var(--color-nebula-teal)]" : "fill-[var(--color-text-muted)]"}
              style={{ fontSize: 9, opacity: 0 }}
            >
              {agent.score.toFixed(2)}
            </text>
          </g>
        ))}
        <rect
          data-part="chosen"
          x={AGENT.x}
          y={AGENT_CENTERS[PIPELINE.chosen] - AGENT.h / 2}
          width={AGENT.w}
          height={AGENT.h}
          rx={3}
          className="fill-[rgba(46,196,182,0.08)] stroke-[var(--color-nebula-teal)]"
          style={{ opacity: 0, filter: "drop-shadow(0 0 6px rgba(46,196,182,0.6))" }}
        />

        <circle
          data-part="packet"
          cx={PHONE.x + PHONE.w}
          cy={MID_Y}
          r={3.5}
          className="fill-[var(--color-nebula-teal)]"
          style={{ opacity: 0, filter: "drop-shadow(0 0 4px rgba(46,196,182,0.9))" }}
        />
      </svg>

      <p data-part="task" className={`${CHIP} top-4 -translate-y-2`}>
        <span aria-hidden="true" className="text-[var(--color-text-muted)]">
          ▸
        </span>
        {PIPELINE.task}
      </p>
      <p data-part="result" className={`${CHIP} bottom-4 translate-y-2 uppercase tracking-[0.14em]`}>
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-nebula-teal)]" />
        {PIPELINE.result}
      </p>
    </div>
  );
}

interface NodeProps {
  x: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  align?: "middle" | "start";
}

function Node({ x, cy, w, h, label, align = "middle" }: NodeProps): JSX.Element {
  return (
    <g>
      <rect
        x={x}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={3}
        className="fill-[rgba(241,240,224,0.03)] stroke-[var(--color-hairline)]"
      />
      <text
        x={align === "middle" ? x + w / 2 : x + 10}
        y={cy + 3.5}
        textAnchor={align}
        className="fill-[var(--color-silver)]"
        style={{ fontSize: 10, letterSpacing: "0.14em" }}
      >
        {label}
      </text>
    </g>
  );
}
