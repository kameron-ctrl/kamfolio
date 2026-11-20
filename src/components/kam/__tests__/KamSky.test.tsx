import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import KamSky from "../KamSky";
import KamPanel from "../KamPanel";
import { useKamStore } from "@/lib/kam/kam-store";
import type { KamDay } from "@/lib/kam/types";

const ONE_DAY: KamDay[] = [
  {
    date: "2026-11-19",
    posts: [
      { id: "b", at: "2026-11-19T21:40:00-05:00", text: "late one" },
      { id: "a", at: "2026-11-19T09:15:00-05:00", text: "coffee first" },
    ],
  },
];

const MIDDAY = ["10:05", "11:10", "12:20", "13:30", "14:45", "15:55"].map((t, i) => ({
  id: `m${i}`,
  at: `2026-11-19T${t}:00-05:00`,
  text: `midday ${i}`,
}));

const FULL_SKY: KamDay[] = [
  { date: "2026-11-19", posts: [ONE_DAY[0].posts[0], ...MIDDAY.reverse(), ONE_DAY[0].posts[1]] },
  { date: "2026-11-18", posts: [{ id: "c", at: "2026-11-18T23:10:00-05:00", text: "yesterday, very late" }] },
];

describe("KamSky", () => {
  test("renders nothing for an empty feed", () => {
    const { container } = render(<KamSky days={[]} onPick={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("falls back to a large pull quote of the latest post when there are too few stars", () => {
    render(<KamSky days={ONE_DAY} onPick={() => {}} />);
    const sky = screen.getByTestId("kam-sky");
    expect(sky).toHaveAttribute("data-mode", "quote");
    expect(sky).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryAllByTestId("kam-star")).toHaveLength(0);
    expect(sky.querySelector(".kam-quote--large")).toHaveTextContent("late one");
    expect(sky).toHaveTextContent("Thu · Nov 19, 2026 · 9:40 PM");
  });

  test("draws a star per post and a line within each day", () => {
    render(<KamSky days={FULL_SKY} onPick={() => {}} />);
    expect(screen.getByTestId("kam-sky")).toHaveAttribute("data-mode", "sky");
    expect(screen.getAllByTestId("kam-star")).toHaveLength(9);
    expect(screen.getByTestId("kam-sky").querySelectorAll("line")).toHaveLength(7);
  });

  test("hovering a star shows its words; leaving goes back to the latest post", () => {
    render(<KamSky days={FULL_SKY} onPick={() => {}} />);
    const quote = (): string => screen.getByTestId("kam-sky").querySelector(".kam-quote__text")!.textContent ?? "";
    expect(quote()).toBe("late one");
    const oldest = screen.getAllByTestId("kam-star")[0]; // 2026-11-18 is the leftmost column
    fireEvent.mouseEnter(oldest);
    expect(quote()).toBe("yesterday, very late");
    expect(oldest).toHaveClass("is-active");
    fireEvent.mouseLeave(oldest);
    expect(quote()).toBe("late one");
  });

  test("clicking a star picks its post", () => {
    const onPick = vi.fn();
    render(<KamSky days={FULL_SKY} onPick={onPick} />);
    fireEvent.click(screen.getAllByTestId("kam-star")[0]);
    expect(onPick).toHaveBeenCalledWith("c");
  });
});

describe("KamPanel with the sky", () => {
  test("a picked star scrolls the feed to that post, focuses it, and highlights it", () => {
    useKamStore.setState({ isOpen: false });
    const order: string[] = [];
    const scrollIntoView = vi.fn(() => order.push("scroll"));
    Element.prototype.scrollIntoView = scrollIntoView;
    const focus = HTMLElement.prototype.focus;
    vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (this: HTMLElement, opts) {
      if (this.id.startsWith("kam-post-")) order.push("focus");
      focus.call(this, opts);
    });
    render(<KamPanel days={FULL_SKY} />);
    act(() => useKamStore.getState().open());
    fireEvent.click(screen.getAllByTestId("kam-star")[0]);
    const target = document.getElementById("kam-post-c")!;
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "center" }));
    expect(document.activeElement).toBe(target);
    expect(target).toHaveClass("is-picked");
    // focusing after the smooth scroll starts would cancel it
    expect(order).toEqual(["focus", "scroll"]);
    vi.restoreAllMocks();
  });

  test("a click on empty sky still closes the panel", () => {
    useKamStore.setState({ isOpen: false });
    render(<KamPanel days={FULL_SKY} />);
    act(() => useKamStore.getState().open());
    fireEvent.click(document.querySelector(".kam-scrim")!);
    expect(useKamStore.getState().isOpen).toBe(false);
  });
});
