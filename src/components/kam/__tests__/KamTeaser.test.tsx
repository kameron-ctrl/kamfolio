import { beforeEach, describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KamTeaser from "../KamTeaser";
import { useKamStore } from "@/lib/kam/kam-store";

const LATEST = { id: "b", at: "2026-11-18T21:40:00-05:00", text: "shipping kam.md tonight" };

beforeEach(() => {
  useKamStore.setState({ isOpen: false });
});

describe("KamTeaser", () => {
  test("asks what Kam is thinking and previews the latest post", () => {
    render(<KamTeaser latest={LATEST} total={4} />);
    expect(screen.getByRole("heading", { name: /what's kam thinking/i })).toBeInTheDocument();
    expect(screen.getByText(/shipping kam\.md tonight/)).toBeInTheDocument();
    expect(screen.getByText(/4 thoughts/i)).toBeInTheDocument();
  });

  test("still invites a visit before the first post", () => {
    render(<KamTeaser total={0} />);
    expect(screen.getByRole("button", { name: /check out kam\.md/i })).toBeInTheDocument();
  });

  test("clicking the call to action opens the side page", async () => {
    const user = userEvent.setup();
    render(<KamTeaser latest={LATEST} total={1} />);
    await user.click(screen.getByRole("button", { name: /check out kam\.md/i }));
    expect(useKamStore.getState().isOpen).toBe(true);
  });

  test("a sideways trackpad scroll over the teaser opens the side page", () => {
    render(<KamTeaser latest={LATEST} total={1} />);
    fireEvent.wheel(screen.getByTestId("kam-teaser"), { deltaX: 60, deltaY: 2 });
    expect(useKamStore.getState().isOpen).toBe(true);
  });

  test("a vertical scroll over the teaser does not", () => {
    render(<KamTeaser latest={LATEST} total={1} />);
    fireEvent.wheel(screen.getByTestId("kam-teaser"), { deltaX: 3, deltaY: 80 });
    expect(useKamStore.getState().isOpen).toBe(false);
  });
});
