import { describe, it, expect } from "vitest";
import { createNebulaTextures } from "@/lib/nebula-textures";

describe("nebula-textures module shape (NEB-01)", () => {
  it("exports createNebulaTextures as a function", () => {
    expect(typeof createNebulaTextures).toBe("function");
  });

  it("createNebulaTextures returns an object with star/nebulaBlob/bokeh/dustGrain keys", () => {
    const result = createNebulaTextures();
    expect(result).toHaveProperty("star");
    expect(result).toHaveProperty("nebulaBlob");
    expect(result).toHaveProperty("bokeh");
    expect(result).toHaveProperty("dustGrain");
  });
});
