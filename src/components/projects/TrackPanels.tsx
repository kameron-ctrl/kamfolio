import { display } from "@/lib/fonts";

/** Opening heading of the projects section. */
export function ProjectsIntro(): JSX.Element {
  return (
    <section
      aria-labelledby="projects-heading"
      className="flex flex-col px-4 pb-10 pt-24 md:px-[8vw] md:pb-[10vh] md:pt-[20vh]"
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

/** Empty breathing room between sections — only the sky and stars show through (PROJ-06). */
export function SkyGap(): JSX.Element {
  return <div aria-hidden="true" className="h-12 md:h-[12vh]" />;
}
