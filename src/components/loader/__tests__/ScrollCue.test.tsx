import { beforeEach, describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import ScrollCue, { CUE_HIDE_AFTER_PX, CUE_TARGET_ID } from "../ScrollCue";
import { useLoadStore } from "@/lib/load-store";
import { useScrollStore } from "@/lib/scroll-store";
import { setLenis } from "@/lib/lenis-instance";
import type Lenis from "lenis";

beforeEach(() => {
  useLoadStore.setState({ sceneReady: false, introDone: false });
  useScrollStore.setState({ scrollY: 0 });
  setLenis(null);
});

describe("ScrollCue", () => {
  test("stays hidden and unfocusable until the intro is done", () => {
    render(<ScrollCue />);
    const cue = screen.getByTestId("scroll-cue");
    expect(cue).not.toHaveClass("is-visible");
    expect(cue).toHaveAttribute("tabindex", "-1");
  });

  test("shows once the intro is done and hides after scrolling", () => {
    useLoadStore.setState({ introDone: true });
    render(<ScrollCue />);
    const cue = screen.getByTestId("scroll-cue");
    expect(cue).toHaveClass("is-visible");

    act(() => {
      useScrollStore.setState({ scrollY: CUE_HIDE_AFTER_PX + 1 });
    });
    expect(cue).not.toHaveClass("is-visible");
  });

  test("glides to About through Lenis when clicked", () => {
    const scrollTo = vi.fn();
    setLenis({ scrollTo } as unknown as Lenis);
    useLoadStore.setState({ introDone: true });
    const target = document.createElement("section");
    target.id = CUE_TARGET_ID;
    document.body.appendChild(target);

    render(<ScrollCue />);
    fireEvent.click(screen.getByTestId("scroll-cue"));

    expect(scrollTo).toHaveBeenCalledWith(target, { immediate: false });
    target.remove();
  });
});
