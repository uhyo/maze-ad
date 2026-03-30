import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticlePage } from "./ArticlePage";

describe("ArticlePage", () => {
  it("renders an article element", () => {
    render(<ArticlePage />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("renders a heading", () => {
    render(<ArticlePage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders multiple paragraphs of content", () => {
    render(<ArticlePage />);
    const paragraphs = screen.getAllByText(/./i, { selector: "p" });
    expect(paragraphs.length).toBeGreaterThanOrEqual(5);
  });
});
