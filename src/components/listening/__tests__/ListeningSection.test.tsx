import { beforeAll, describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ListeningSection from "../ListeningSection";
import { NowPlaying } from "../NowPlaying";
import Artwork from "../Artwork";
import type { Track } from "@/lib/listening/types";

vi.mock("@/hooks/useScrollReveal", () => ({ useStaggerReveal: () => undefined }));
vi.mock("@/lib/fonts", () => ({ display: { className: "font-display" } }));

beforeAll(() => {
  // jsdom has no IntersectionObserver
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe(): void {}
      disconnect(): void {}
    }
  );
});

const track = (over: Partial<Track> = {}): Track => ({
  id: "t",
  title: "Nights",
  artist: "Frank Ocean",
  album: "Blonde",
  artworkUrl: null,
  playedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  isNowPlaying: false,
  ...over,
});

describe("ListeningSection", () => {
  test("renders nothing when no source is configured", () => {
    const { container } = render(<ListeningSection source={{ kind: "off" }} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the featured play and history from the fixture", async () => {
    render(<ListeningSection source={{ kind: "fixture" }} />);
    expect(await screen.findByText("Now playing")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recently played" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  test("shows the offline line when the first fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    // useInView needs a real intersection to start fetching
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private cb: IntersectionObserverCallback) {}
        observe(): void {
          this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
        }
        disconnect(): void {}
      }
    );
    render(<ListeningSection source={{ kind: "lastfm", user: "u", apiKey: "k", limit: 6 }} />);
    expect(await screen.findByText(/record player's offline/)).toBeInTheDocument();
  });
});

describe("NowPlaying", () => {
  test("a past play shows a muted relative time instead of the live label", () => {
    render(<NowPlaying track={track()} />);
    expect(screen.getByText(/Last played/)).toHaveTextContent("Last played · 3h ago");
    expect(screen.queryByText("Now playing")).not.toBeInTheDocument();
  });

  test("links the record to an Apple Music search", () => {
    render(<NowPlaying track={track({ isNowPlaying: true, playedAt: null })} />);
    const link = screen.getByRole("link", { name: /Find Nights by Frank Ocean on Apple Music/ });
    expect(link.getAttribute("href")).toContain("music.apple.com");
  });
});

describe("Artwork", () => {
  test("falls back to a monogram tile when there is no cover", () => {
    const { container } = render(<Artwork track={track()} size={52} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("N");
  });
});
