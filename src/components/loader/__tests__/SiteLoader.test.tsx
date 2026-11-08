import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import SiteLoader, { LOADER_EXIT_MS, LOADER_MAX_MS, LOADER_MIN_MS, formatPercent } from "../SiteLoader";
import { useLoadStore } from "@/lib/load-store";

const progress = { value: 0 };

vi.mock("@react-three/drei", () => ({ useProgress: () => ({ progress: progress.value }) }));

beforeEach(() => {
  vi.useFakeTimers();
  progress.value = 0;
  useLoadStore.setState({ sceneReady: false, introDone: false });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatPercent", () => {
  test("pads to three digits and clamps to 0–100", () => {
    expect(formatPercent(4.6)).toBe("005");
    expect(formatPercent(47)).toBe("047");
    expect(formatPercent(-3)).toBe("000");
    expect(formatPercent(140)).toBe("100");
  });
});

describe("SiteLoader", () => {
  test("shows real texture progress while loading", () => {
    progress.value = 47;
    render(<SiteLoader />);
    expect(screen.getByTestId("site-loader-percent")).toHaveTextContent("047%");
    expect(screen.getByTestId("site-loader")).not.toHaveClass("is-leaving");
  });

  test("waits the minimum time even when the scene is ready at once", () => {
    useLoadStore.setState({ sceneReady: true });
    render(<SiteLoader />);
    act(() => {
      vi.advanceTimersByTime(LOADER_MIN_MS - 1);
    });
    expect(screen.getByTestId("site-loader")).not.toHaveClass("is-leaving");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("site-loader")).toHaveClass("is-leaving");
    expect(useLoadStore.getState().introDone).toBe(true);
  });

  test("leaves when the scene reports ready, then unmounts after the exit", () => {
    render(<SiteLoader />);
    act(() => {
      vi.advanceTimersByTime(LOADER_MIN_MS);
    });
    expect(screen.getByTestId("site-loader")).not.toHaveClass("is-leaving");

    act(() => {
      useLoadStore.getState().markSceneReady();
    });
    expect(screen.getByTestId("site-loader-percent")).toHaveTextContent("100%");

    act(() => {
      vi.advanceTimersByTime(LOADER_EXIT_MS);
    });
    expect(screen.queryByTestId("site-loader")).not.toBeInTheDocument();
  });

  test("gives up after the max wait if the scene never loads", () => {
    render(<SiteLoader />);
    act(() => {
      vi.advanceTimersByTime(LOADER_MAX_MS);
    });
    expect(screen.getByTestId("site-loader")).toHaveClass("is-leaving");
  });
});
