import { renderHook, act } from "@testing-library/react";
import { useTypewriter } from "@/hooks/useTypewriter";

describe("useTypewriter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns empty string before startSignal is true", () => {
    const { result } = renderHook(() =>
      useTypewriter("Full-stack developer & creative technologist", 60, false)
    );
    expect(result.current).toBe("");
  });

  it("begins stepping through characters after startSignal fires", () => {
    const { result, rerender } = renderHook(
      ({ startSignal }: { startSignal: boolean }) =>
        useTypewriter("Full-stack developer & creative technologist", 60, startSignal),
      { initialProps: { startSignal: false } }
    );

    rerender({ startSignal: true });
    act(() => vi.advanceTimersByTime(60 * 3));

    expect(result.current.length).toBeGreaterThanOrEqual(1);
    expect(result.current.length).toBeLessThanOrEqual(3);
  });

  it("returns the full text when typing completes", () => {
    const { result } = renderHook(() =>
      useTypewriter("Full-stack developer & creative technologist", 60, true)
    );

    act(() => vi.advanceTimersByTime(60 * 50));

    expect(result.current).toBe("Full-stack developer & creative technologist");
  });
});
