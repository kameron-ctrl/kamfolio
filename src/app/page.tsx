/**
 * Home page. Server Component. One vertical scroll, top to bottom:
 *
 *   1. Moon hero (moon drawn by the global canvas)
 *   2. About (docs/specs/about-skills-involvement)
 *   3. Projects: heading, then cards separated by empty sky (docs/specs/project-cards)
 *   4. Talks & writing (docs/specs/talks), then All Things Open conference experience
 *   4b. kam.md doorway: teaser that opens the Twitter-style side page (docs/specs/kam-md)
 *   5. Skills, then Campus involvement: Strikers, Kappa Kappa Psi, Marching "100" (each with photos)
 *   6. Journey timeline (docs/specs/personality-timeline)
 *   7. Listening: now playing on Apple Music via Last.fm (docs/specs/listening)
 *   8. Resume: the PDF page plus download / open links
 */
import { Fragment } from "react";
import ConferenceSection from "@/components/conference/ConferenceSection";
import AboutSection from "@/components/about/AboutSection";
import InvolvementHeader from "@/components/involvement/InvolvementHeader";
import OrgFeature from "@/components/involvement/OrgFeature";
import KamPanel from "@/components/kam/KamPanel";
import KamTeaser from "@/components/kam/KamTeaser";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import ListeningSection from "@/components/listening/ListeningSection";
import MoonHero from "@/components/moon/MoonHero";
import ProjectCard from "@/components/projects/ProjectCard";
import ResumeSection from "@/components/resume/ResumeSection";
import { ProjectsIntro, SkyGap } from "@/components/projects/TrackPanels";
import SkillsSection from "@/components/skills/SkillsSection";
import TalksPanel from "@/components/talks/TalksPanel";
import { ORGANIZATIONS } from "@/content/about";
import { PROJECTS } from "@/content/projects";
import { countPosts } from "@/lib/kam/format";
import { loadKamDays } from "@/lib/kam/load";

export default function Page(): JSX.Element {
  // Read at build time: the agent commits a JSON file per public day, and each commit redeploys
  const kamDays = loadKamDays();

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
      <KamTeaser latest={kamDays[0]?.posts[0]} total={countPosts(kamDays)} />
      <SkillsSection />
      <InvolvementHeader />
      {ORGANIZATIONS.map((org, i) => (
        <OrgFeature key={org.id} org={org} index={i} />
      ))}
      <JourneyTimeline />
      <ListeningSection />
      <ResumeSection />
      <KamPanel days={kamDays} />
    </main>
  );
}
