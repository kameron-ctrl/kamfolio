import { display } from "@/lib/fonts";

/** Opening panel of the horizontal track. */
export function ProjectsIntro(): JSX.Element {
  return (
    <section
      aria-labelledby="projects-heading"
      className="flex shrink-0 flex-col justify-center px-4 pb-10 pt-24 md:h-screen md:w-[50vw] md:px-0 md:pl-[8vw] md:pt-0"
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Selected work
      </p>
      <h2
        id="projects-heading"
        className={`${display.className} mt-5 bg-[image:var(--gradient-silver)] bg-clip-text text-[clamp(28px,3.4vw,52px)] uppercase leading-[0.95] text-transparent`}
      >
        Things I&apos;ve built
      </h2>
    </section>
  );
}

/** Empty breathing room between cards — only the sky and stars show through (PROJ-06). */
export function TrackGap(): JSX.Element {
  return <div aria-hidden="true" className="h-12 shrink-0 md:h-screen md:w-[40vw]" />;
}
