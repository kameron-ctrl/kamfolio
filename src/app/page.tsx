/**
 * Home page. Server Component. One vertical scroll, top to bottom:
 *
 *   1. Moon hero (moon drawn by the global canvas)
 *   2. About (docs/specs/about-skills-involvement)
 *   3. Projects: heading, then cards separated by empty sky (docs/specs/project-cards)
 *   4. Talks & writing (docs/specs/talks), then All Things Open conference experience
 *   5. Skills, then Campus involvement: Strikers, Kappa Kappa Psi, Marching "100" (each with photos)
 *   6. Journey timeline (docs/specs/personality-timeline)
 */
import { Fragment } from "react";
import ConferenceSection from "@/components/conference/ConferenceSection";
import AboutSection from "@/components/about/AboutSection";
import InvolvementHeader from "@/components/involvement/InvolvementHeader";
import OrgFeature from "@/components/involvement/OrgFeature";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import MoonHero from "@/components/moon/MoonHero";
import ProjectCard from "@/components/projects/ProjectCard";
import { ProjectsIntro, SkyGap } from "@/components/projects/TrackPanels";
import SkillsSection from "@/components/skills/SkillsSection";
import TalksPanel from "@/components/talks/TalksPanel";
import { ORGANIZATIONS } from "@/content/about";
import { PROJECTS } from "@/content/projects";

export default function Page(): JSX.Element {
  return (
    <main>
      <section style={{ minHeight: "250vh" }} data-testid="vertical-zone">
        <MoonHero />
      </section>

      <AboutSection />
      <ProjectsIntro />
      {PROJECTS.map((project, i) => (
        <Fragment key={project.id}>
          <ProjectCard project={project} index={i} total={PROJECTS.length} />
          <SkyGap />
        </Fragment>
      ))}

      <TalksPanel />
      <ConferenceSection />
      <SkillsSection />
      <InvolvementHeader />
      {ORGANIZATIONS.map((org, i) => (
        <OrgFeature key={org.id} org={org} index={i} />
      ))}
      <JourneyTimeline />
    </main>
  );
}
