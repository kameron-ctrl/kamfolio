import { describe, expect, test } from "vitest";
import { BAR_ALWAYS_SHOWN_PX, BAR_DIRECTION_DELTA_PX, nextBarState } from "../bar-visibility";

const FAR = BAR_ALWAYS_SHOWN_PX + 500;

describe("nextBarState", () => {
  test("stays shown near the top of the page, whatever the direction", () => {
    expect(nextBarState({ hidden: true, anchorY: 0 }, BAR_ALWAYS_SHOWN_PX - 1)).toEqual({
      hidden: false,
      anchorY: BAR_ALWAYS_SHOWN_PX - 1,
    });
  });

  test("hides when scrolling down past the threshold", () => {
    const next = nextBarState({ hidden: false, anchorY: FAR }, FAR + BAR_DIRECTION_DELTA_PX + 1);
    expect(next.hidden).toBe(true);
  });

  test("shows again when scrolling up", () => {
    const next = nextBarState({ hidden: true, anchorY: FAR }, FAR - BAR_DIRECTION_DELTA_PX - 1);
    expect(next.hidden).toBe(false);
  });

  test("ignores jitter smaller than the delta and keeps the anchor", () => {
    const prev = { hidden: true, anchorY: FAR };
    expect(nextBarState(prev, FAR - (BAR_DIRECTION_DELTA_PX - 1))).toBe(prev);
  });

  test("keeps hiding while scrolling further down and moves the anchor along", () => {
    const prev = { hidden: true, anchorY: FAR };
    const next = nextBarState(prev, FAR + 200);
    expect(next.hidden).toBe(true);
    expect(next.anchorY).toBe(FAR + 200);
  });
});
