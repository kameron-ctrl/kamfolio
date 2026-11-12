import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AgentPipeline from "../AgentPipeline";
import { PIPELINE } from "@/content/projects";

vi.mock("@/lib/reduced-motion", () => ({ prefersReducedMotion: () => true }));

describe("AgentPipeline", () => {
  test("describes the whole flow for screen readers", () => {
    render(<AgentPipeline revealed={false} />);
    const figure = screen.getByRole("img");
    expect(figure).toHaveAccessibleName(/Telegram/);
    expect(figure).toHaveAccessibleName(new RegExp(PIPELINE.agents[PIPELINE.chosen].name));
  });

  test("draws the task, every agent and the result", () => {
    const { container } = render(<AgentPipeline revealed={false} />);
    const text = container.textContent ?? "";
    expect(text).toContain(PIPELINE.task);
    expect(text).toContain(PIPELINE.result);
    PIPELINE.agents.forEach((a) => expect(text).toContain(a.name.toUpperCase()));
  });

  test("shows the finished state at once under reduced motion", () => {
    const { container } = render(<AgentPipeline revealed />);
    const result = container.querySelector("[data-part='result']") as HTMLElement;
    expect(result.style.opacity).toBe("1");
  });
});
