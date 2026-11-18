import { beforeEach, describe, expect, test } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KamPanel from "../KamPanel";
import { KAM_HASH, useKamStore } from "@/lib/kam/kam-store";
import type { KamDay } from "@/lib/kam/types";

const DAYS: KamDay[] = [
  {
    date: "2026-11-18",
    posts: [
      { id: "b", at: "2026-11-18T21:40:00-05:00", text: "shipping kam.md tonight https://kameron-ctrl.com" },
      { id: "a", at: "2026-11-18T09:15:00-05:00", text: "coffee first" },
    ],
  },
  { date: "2026-11-17", posts: [{ id: "c", at: "2026-11-17T12:00:00-05:00", text: "yesterday's thought" }] },
];

beforeEach(() => {
  useKamStore.setState({ isOpen: false });
  window.history.replaceState(null, "", "/");
});

function openPanel(): void {
  act(() => useKamStore.getState().open());
}

describe("KamPanel", () => {
  test("stays hidden until opened", () => {
    render(<KamPanel days={DAYS} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("shows the feed grouped by day, newest first", () => {
    render(<KamPanel days={DAYS} />);
    openPanel();
    const dialog = screen.getByRole("dialog", { name: "kam.md" });
    const days = within(dialog).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(days).toEqual(["Wed · Nov 18, 2026", "Tue · Nov 17, 2026"]);
    const posts = within(dialog).getAllByRole("article");
    expect(posts).toHaveLength(3);
    expect(posts[0]).toHaveTextContent("shipping kam.md tonight");
    expect(posts[0]).toHaveTextContent("9:40 PM");
    expect(within(dialog).getByText(/3 thoughts/)).toBeInTheDocument();
  });

  test("links in posts open safely in a new tab", () => {
    render(<KamPanel days={DAYS} />);
    openPanel();
    const link = screen.getByRole("link", { name: "https://kameron-ctrl.com" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });

  test("shows an empty state with no posts", () => {
    render(<KamPanel days={[]} />);
    openPanel();
    expect(screen.getByText(/no thoughts yet/i)).toBeInTheDocument();
  });

  test("Escape and the back button close it", async () => {
    const user = userEvent.setup();
    render(<KamPanel days={DAYS} />);
    openPanel();
    await user.keyboard("{Escape}");
    expect(useKamStore.getState().isOpen).toBe(false);

    openPanel();
    await user.click(screen.getByRole("button", { name: /back to the site/i }));
    expect(useKamStore.getState().isOpen).toBe(false);
  });

  test("moves focus into the panel when it opens", () => {
    render(<KamPanel days={DAYS} />);
    openPanel();
    expect(screen.getByRole("button", { name: /back to the site/i })).toHaveFocus();
  });

  test("opens on load when the URL is the kam.md link", () => {
    window.history.replaceState(null, "", `/${KAM_HASH}`);
    render(<KamPanel days={DAYS} />);
    expect(screen.getByRole("dialog", { name: "kam.md" })).toBeInTheDocument();
  });

  test("puts the kam.md link in the URL while open", () => {
    render(<KamPanel days={DAYS} />);
    openPanel();
    expect(window.location.hash).toBe(KAM_HASH);
  });
});
