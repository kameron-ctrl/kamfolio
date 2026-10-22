import { NAME_FADE_DELAY, NAME_FADE_DURATION } from "@/components/hero/HeroOverlay";

describe("HeroOverlay constants", () => {
  describe("NAME_FADE_DELAY — HERO-06", () => {
    it("is between 1.2 and 1.5 seconds per D-05", () => {
      expect(NAME_FADE_DELAY).toBeGreaterThanOrEqual(1.2);
      expect(NAME_FADE_DELAY).toBeLessThanOrEqual(1.5);
    });
  });

  describe("NAME_FADE_DURATION — HERO-06", () => {
    it("is between 1.5 and 2.0 seconds per D-06", () => {
      expect(NAME_FADE_DURATION).toBeGreaterThanOrEqual(1.5);
      expect(NAME_FADE_DURATION).toBeLessThanOrEqual(2.0);
    });
  });

});
