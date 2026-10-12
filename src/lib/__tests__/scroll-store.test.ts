import { describe, it, expect, beforeEach } from "vitest";
import { useScrollStore, pageProgress } from "@/lib/scroll-store";

describe("useScrollStore — initial state (FOUND-01)", () => {
  beforeEach(() => {
    // Reset the store between tests by re-setting to defaults
    useScrollStore.setState({
      scrollY: 0,
      velocity: 0,
      displayVelocity: 0,
      phase: "vertical",
      progress: 0,
    });
  });

  it("has correct initial values", () => {
    const state = useScrollStore.getState();
    expect(state.scrollY).toBe(0);
    expect(state.velocity).toBe(0);
    expect(state.displayVelocity).toBe(0);
    expect(state.phase).toBe("vertical");
    expect(state.progress).toBe(0);
  });

  it("exposes a set action", () => {
    expect(typeof useScrollStore.getState().set).toBe("function");
  });
});

describe("useScrollStore — set action and lerp (FOUND-03)", () => {
  beforeEach(() => {
    useScrollStore.setState({
      scrollY: 0,
      velocity: 0,
      displayVelocity: 0,
      phase: "vertical",
      progress: 0,
    });
  });

  it("updates scrollY without affecting unrelated fields", () => {
    useScrollStore.getState().set({ scrollY: 100 });
    const state = useScrollStore.getState();
    expect(state.scrollY).toBe(100);
    expect(state.velocity).toBe(0);
    expect(state.phase).toBe("vertical");
  });

  it("updates phase and progress atomically", () => {
    useScrollStore.getState().set({ phase: "horizontal", progress: 0.5 });
    const state = useScrollStore.getState();
    expect(state.phase).toBe("horizontal");
    expect(state.progress).toBe(0.5);
  });

  it("lerps displayVelocity toward velocity by factor 0.15 on a single set", () => {
    useScrollStore.getState().set({ velocity: 10 });
    const state = useScrollStore.getState();
    expect(state.velocity).toBe(10);
    // 0 + (10 - 0) * 0.15 = 1.5
    expect(state.displayVelocity).toBeCloseTo(1.5, 3);
  });

  it("lerps displayVelocity progressively across multiple sets", () => {
    useScrollStore.getState().set({ velocity: 10 });
    useScrollStore.getState().set({ velocity: 10 });
    const state = useScrollStore.getState();
    // After 1st: 1.5; After 2nd: 1.5 + (10 - 1.5) * 0.15 = 2.775
    expect(state.displayVelocity).toBeCloseTo(2.775, 3);
  });

  it("converges displayVelocity toward velocity over many ticks", () => {
    for (let i = 0; i < 100; i++) {
      useScrollStore.getState().set({ velocity: 10 });
    }
    const state = useScrollStore.getState();
    expect(state.displayVelocity).toBeGreaterThan(9.9);
    expect(state.displayVelocity).toBeLessThanOrEqual(10);
  });

  it("continues to lerp displayVelocity even when velocity is omitted from set", () => {
    useScrollStore.getState().set({ velocity: 10 });
    // displayVelocity now ≈ 1.5; velocity is 10
    useScrollStore.getState().set({ scrollY: 50 }); // velocity unchanged, displayVelocity should advance
    const state = useScrollStore.getState();
    expect(state.scrollY).toBe(50);
    // displayVelocity = 1.5 + (10 - 1.5) * 0.15 = 2.775
    expect(state.displayVelocity).toBeCloseTo(2.775, 3);
  });
});

describe("pageProgress — whole-page scroll fraction (all-vertical layout)", () => {
  it("is 0 at the top", () => {
    expect(pageProgress(0, 4000)).toBe(0);
  });

  it("is the scrolled fraction mid-page", () => {
    expect(pageProgress(1000, 4000)).toBeCloseTo(0.25, 6);
  });

  it("is 1 at the bottom", () => {
    expect(pageProgress(4000, 4000)).toBe(1);
  });

  it("clamps overscroll at either end", () => {
    expect(pageProgress(-40, 4000)).toBe(0);
    expect(pageProgress(4100, 4000)).toBe(1);
  });

  it("is 0 when the page can't scroll", () => {
    expect(pageProgress(0, 0)).toBe(0);
    expect(pageProgress(10, -5)).toBe(0);
  });
});
