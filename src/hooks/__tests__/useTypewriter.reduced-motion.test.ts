Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn().mockImplementation((query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)", media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() })) });

import { renderHook } from "@testing-library/react";
import { useTypewriter } from "@/hooks/useTypewriter";

describe("useTypewriter — reduced motion", () => {
  it("returns full text immediately when startSignal is true and prefers-reduced-motion is active", () => {
    const { result } = renderHook(() =>
      useTypewriter("Full-stack developer & creative technologist", 60, true)
    );
    expect(result.current).toBe("Full-stack developer & creative technologist");
  });
});
