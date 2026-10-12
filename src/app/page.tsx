/**
 * Home page. Server Component. One vertical scroll, top to bottom:
 *
 *   1. Moon hero (moon drawn by the global canvas)
 *   2. Projects: heading, then cards separated by empty sky (docs/specs/project-cards)
 *   3. Talks & writing (docs/specs/talks)
 *   4. Strikers + photo gallery, journey timeline (docs/specs/personality-timeline)
 */
import { Fragment } from "react";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import MoonHero from "@/components/moon/MoonHero";
import ProjectCard from "@/components/projects/ProjectCard";
import { ProjectsIntro, SkyGap } from "@/components/projects/TrackPanels";
import StrikersGallery from "@/components/strikers/StrikersGallery";
import StrikersPanel from "@/components/strikers/StrikersPanel";
import TalksPanel from "@/components/talks/TalksPanel";
import { PROJECTS } from "@/content/projects";

export default function Page(): JSX.Element {
  return (
    <main>
      <section style={{ minHeight: "250vh" }} data-testid="vertical-zone">
        <MoonHero />
      </section>

      <ProjectsIntro />
      {PROJECTS.map((project, i) => (
        <Fragment key={project.id}>
          <ProjectCard project={project} index={i} total={PROJECTS.length} />
          <SkyGap />
        </Fragment>
      ))}

      <TalksPanel />
      <StrikersPanel />
      <StrikersGallery />
      <JourneyTimeline />
    </main>
  );
}
