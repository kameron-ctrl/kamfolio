export const CONFERENCE = {
  meta: "Conference · 2026 · Raleigh, North Carolina",
  title: "All Things Open 2026",
  intro:
    "As an extension of my UCSC internship, I attended All Things Open in Raleigh to explore how open source powers enterprise technology. It was a chance to take the work I was doing through the Open Source Contributor Catalyst Program and connect it to the wider open source ecosystem.",
  reflection:
    "I came away with a broader view of the technologies teams rely on—and the questions behind adopting them: how they connect, how access is managed, and what it takes to run them in practice. The experience gave me more context for my own contributions and more ideas to explore as a developer.",
  takeaway:
    "One standout was NetBird, an open source peer-to-peer networking platform in the same space as Tailscale. It uses WireGuard to connect devices through encrypted private networks, with centralized access management. Learning about it made secure networking feel more tangible, from enterprise infrastructure to my own homelab.",
  photos: [
    {
      src: "/conference/ato-2026-03.jpg",
      alt: "Conference attendees posing together in front of the All Things Open welcome backdrop",
      width: 1800,
      height: 1350,
    },
    {
      src: "/conference/ato-2026-02.jpg",
      alt: "All Things Open welcome display featuring an astronaut illustration",
      width: 1800,
      height: 1350,
    },
    {
      src: "/conference/ato-2026-01.jpg",
      alt: "Kameron's conference badge and lanyard in the All Things Open venue",
      width: 1350,
      height: 1800,
    },
    {
      src: "/conference/ato-2026-04.jpg",
      alt: "An attendee posing beneath the All Things Open banner in the conference lobby",
      width: 1350,
      height: 1800,
    },
  ],
} as const;
