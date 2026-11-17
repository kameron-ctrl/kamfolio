import { beforeEach, describe, expect, test } from "vitest";
import { act, render, screen } from "@testing-library/react";
import ContactBar from "../ContactBar";
import { BAR_ALWAYS_SHOWN_PX } from "../bar-visibility";
import { useLoadStore } from "@/lib/load-store";
import { useScrollStore } from "@/lib/scroll-store";
import { GITHUB_URL, LINKEDIN_URL, mailtoHref } from "@/content/contact";
import { RESUME } from "@/content/resume";

beforeEach(() => {
  useLoadStore.setState({ sceneReady: false, introDone: false });
  useScrollStore.setState({ scrollY: 0 });
});

function scrollTo(y: number): void {
  act(() => {
    useScrollStore.setState({ scrollY: y });
  });
}

describe("ContactBar", () => {
  test("is a labelled nav with resume, GitHub, LinkedIn and email links", () => {
    useLoadStore.setState({ introDone: true });
    render(<ContactBar />);
    const nav = screen.getByRole("navigation", { name: /contact/i });
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /resume/i })).toHaveAttribute("href", RESUME.pdf);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", GITHUB_URL);
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute("href", LINKEDIN_URL);
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute("href", mailtoHref());
  });

  test("new-tab links are safe and say they open a new tab", () => {
    useLoadStore.setState({ introDone: true });
    render(<ContactBar />);
    const github = screen.getByRole("link", { name: /github/i });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(github.getAttribute("aria-label")).toMatch(/new tab/i);
    expect(screen.getByRole("link", { name: /email/i })).not.toHaveAttribute("target");
  });

  test("stays hidden and out of the tab order until the intro is done", () => {
    render(<ContactBar />);
    const bar = screen.getByTestId("contact-bar");
    expect(bar).not.toHaveClass("is-visible");
    expect(bar).toHaveAttribute("aria-hidden", "true");
    for (const link of Array.from(bar.querySelectorAll("a"))) expect(link).toHaveAttribute("tabindex", "-1");

    act(() => useLoadStore.setState({ introDone: true }));
    expect(bar).toHaveClass("is-visible");
    expect(bar).not.toHaveAttribute("aria-hidden");
  });

  test("tucks away on scroll down and returns on scroll up", () => {
    useLoadStore.setState({ introDone: true });
    render(<ContactBar />);
    const bar = screen.getByTestId("contact-bar");

    scrollTo(BAR_ALWAYS_SHOWN_PX + 400);
    expect(bar).toHaveClass("is-tucked");

    scrollTo(BAR_ALWAYS_SHOWN_PX + 200);
    expect(bar).not.toHaveClass("is-tucked");
    expect(bar).toHaveClass("has-tucked"); // returns skip the entrance delay
  });

  test("tucked links stay keyboard reachable", () => {
    useLoadStore.setState({ introDone: true });
    render(<ContactBar />);
    scrollTo(BAR_ALWAYS_SHOWN_PX + 400);
    const github = screen.getByRole("link", { name: /github/i });
    expect(github).not.toHaveAttribute("tabindex", "-1");
  });
});
