import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { MobileControls } from "./MobileControls";

describe("MobileControls", () => {
  const mockMove = vi.fn();

  afterEach(() => {
    mockMove.mockClear();
  });

  it("should render four directional arrow buttons", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    expect(screen.getByTestId("dpad-up")).toBeInTheDocument();
    expect(screen.getByTestId("dpad-down")).toBeInTheDocument();
    expect(screen.getByTestId("dpad-left")).toBeInTheDocument();
    expect(screen.getByTestId("dpad-right")).toBeInTheDocument();
  });

  it("should call move('up') when the up button is clicked", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    fireEvent.click(screen.getByTestId("dpad-up"));
    expect(mockMove).toHaveBeenCalledWith("up");
    expect(mockMove).toHaveBeenCalledTimes(1);
  });

  it("should call move('down') when the down button is clicked", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    fireEvent.click(screen.getByTestId("dpad-down"));
    expect(mockMove).toHaveBeenCalledWith("down");
    expect(mockMove).toHaveBeenCalledTimes(1);
  });

  it("should call move('left') when the left button is clicked", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    fireEvent.click(screen.getByTestId("dpad-left"));
    expect(mockMove).toHaveBeenCalledWith("left");
    expect(mockMove).toHaveBeenCalledTimes(1);
  });

  it("should call move('right') when the right button is clicked", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    fireEvent.click(screen.getByTestId("dpad-right"));
    expect(mockMove).toHaveBeenCalledWith("right");
    expect(mockMove).toHaveBeenCalledTimes(1);
  });

  it("should have accessible button labels", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    expect(screen.getByTestId("dpad-up")).toHaveAccessibleName("Up");
    expect(screen.getByTestId("dpad-down")).toHaveAccessibleName("Down");
    expect(screen.getByTestId("dpad-left")).toHaveAccessibleName("Left");
    expect(screen.getByTestId("dpad-right")).toHaveAccessibleName("Right");
  });

  it("should render the controls container with a className", () => {
    render(<MobileControls move={mockMove} visible={true} />);

    const container = screen.getByTestId("mobile-controls");
    // The CSS module class contains touch-action: manipulation
    expect(container.className).toBeTruthy();
  });
});
