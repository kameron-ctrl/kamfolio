import { describe, it, expect } from "vitest";
import { createNebulaTextures } from "@/lib/nebula-textures";

/**
 * jsdom canvas getContext("2d") supports createRadialGradient + fillRect,
 * so our gradient is actually drawn and getImageData reads back real pixels.
 */
function getPixelAlpha(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable in test env");
  const data = ctx.getImageData(x, y, 1, 1).data;
  return data[3]; // alpha 0..255
}

describe("nebula-textures module shape (NEB-01)", () => {
  it("exports createNebulaTextures as a function", () => {
    expect(typeof createNebulaTextures).toBe("function");
  });

  it("returns an object with star/nebulaBlob/bokeh/dustGrain keys", () => {
    const result = createNebulaTextures();
    expect(result).toHaveProperty("star");
    expect(result).toHaveProperty("nebulaBlob");
    expect(result).toHaveProperty("bokeh");
    expect(result).toHaveProperty("dustGrain");
  });
});

describe("nebula-textures sprite dimensions (UI-SPEC sprite character)", () => {
  const t = createNebulaTextures();

  it("star sprite is 16x16", () => {
    const img = t.star.image as HTMLCanvasElement;
    expect(img.width).toBe(16);
    expect(img.height).toBe(16);
  });

  it("nebulaBlob sprite is 64x64", () => {
    const img = t.nebulaBlob.image as HTMLCanvasElement;
    expect(img.width).toBe(64);
    expect(img.height).toBe(64);
  });

  it("bokeh sprite is 64x64", () => {
    const img = t.bokeh.image as HTMLCanvasElement;
    expect(img.width).toBe(64);
    expect(img.height).toBe(64);
  });

  it("dustGrain sprite is 8x8", () => {
    const img = t.dustGrain.image as HTMLCanvasElement;
    expect(img.width).toBe(8);
    expect(img.height).toBe(8);
  });
});

describe("nebula-textures actually draws pixels (NEB-01)", () => {
  const t = createNebulaTextures();

  it("star center pixel has alpha > 0", () => {
    const img = t.star.image as HTMLCanvasElement;
    expect(getPixelAlpha(img, 8, 8)).toBeGreaterThan(0);
  });

  it("nebulaBlob center pixel has alpha > 0", () => {
    const img = t.nebulaBlob.image as HTMLCanvasElement;
    expect(getPixelAlpha(img, 16, 16)).toBeGreaterThan(0);
  });

  it("bokeh center pixel has alpha > 0", () => {
    const img = t.bokeh.image as HTMLCanvasElement;
    expect(getPixelAlpha(img, 32, 32)).toBeGreaterThan(0);
  });

  it("dustGrain center pixel has alpha > 0", () => {
    const img = t.dustGrain.image as HTMLCanvasElement;
    expect(getPixelAlpha(img, 4, 4)).toBeGreaterThan(0);
  });

  it("star corner pixel alpha < center alpha (gradient fades outward)", () => {
    const img = t.star.image as HTMLCanvasElement;
    expect(getPixelAlpha(img, 0, 0)).toBeLessThan(getPixelAlpha(img, 8, 8));
  });

  it("nebulaBlob corner pixel alpha < center alpha", () => {
    const img = t.nebulaBlob.image as HTMLCanvasElement;
    expect(getPixelAlpha(img, 0, 0)).toBeLessThan(getPixelAlpha(img, 16, 16));
  });
});

describe("nebula-textures sRGB color space (NEB-01)", () => {
  const t = createNebulaTextures();

  it("textures declare SRGBColorSpace for correct AdditiveBlending math", async () => {
    const THREE = await import("three");
    expect(t.star.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(t.nebulaBlob.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(t.bokeh.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(t.dustGrain.colorSpace).toBe(THREE.SRGBColorSpace);
  });
});
