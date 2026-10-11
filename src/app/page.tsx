/**
 * Home page. Server Component.
 *
 *   1. Vertical zone — moon hero (moon drawn by the global canvas)
 *   2. Horizontal zone — pinned track (desktop) / vertical stack (<768px):
 *      intro, then project cards separated by empty gaps (docs/specs/project-cards)
 *   3. Trailing spacer so the pin doesn't end abruptly
 */
import { Fragment } from "react";
import HorizontalTrack from "@/components/horizontal-track/HorizontalTrack";
import MoonHero from "@/components/moon/MoonHero";
import ProjectCard from "@/components/projects/ProjectCard";
import { ProjectsIntro, TrackGap } from "@/components/projects/TrackPanels";
import { PROJECTS } from "@/content/projects";

export default function Page(): JSX.Element {
  return (
    <main>
      <section style={{ minHeight: "250vh" }} data-testid="vertical-zone">
        <MoonHero />
      </section>

      <HorizontalTrack>
        <ProjectsIntro />
        {PROJECTS.map((project, i) => (
          <Fragment key={project.id}>
            <ProjectCard project={project} index={i} total={PROJECTS.length} />
            <TrackGap />
          </Fragment>
        ))}
      </HorizontalTrack>

      <section style={{ minHeight: "20vh" }} data-testid="trailing-spacer" />
    </main>
  );
}
