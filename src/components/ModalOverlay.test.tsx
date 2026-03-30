import { render, screen } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ModalOverlay } from "./ModalOverlay";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("ModalOverlay", () => {
  it("renders children inside the overlay", () => {
    render(
      <ModalOverlay>
        <div data-testid="child">Content</div>
      </ModalOverlay>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("sets body overflow to hidden on mount", () => {
    render(
      <ModalOverlay>
        <div />
      </ModalOverlay>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <ModalOverlay>
        <div />
      </ModalOverlay>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("renders a fixed-position overlay element", () => {
    render(
      <ModalOverlay>
        <div />
      </ModalOverlay>
    );
    expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();
  });
});
