"use client";

/** Campus involvement header — docs/specs/about-skills-involvement. Strikers follows it. */
import { useRef } from "react";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function InvolvementHeader(): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useStaggerReveal(ref, 0);

  return (
    <div ref={ref} className="px-4 pt-16 md:px-[8vw] md:pt-[16vh]">
      <SectionHeading id="involvement-heading" kicker="Campus involvement" title="Beyond the classroom" />
    </div>
  );
}
