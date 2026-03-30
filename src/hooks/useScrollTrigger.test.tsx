import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useScrollTrigger } from "./useScrollTrigger";

function setScrollState(scrollY: number, scrollHeight: number, innerHeight: number) {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true });
  Object.defineProperty(window, "innerHeight", { value: innerHeight, writable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
}

function simulateScroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("useScrollTrigger", () => {
  beforeEach(() => {
    // Default: page is 2000px tall, viewport 800px, not scrolled
    setScrollState(0, 2000, 800);
  });

  it("returns isTriggered as false initially", () => {
    const { result } = renderHook(() => useScrollTrigger());
    expect(result.current.isTriggered).toBe(false);
  });

  it("returns isDismissed as false initially", () => {
    const { result } = renderHook(() => useScrollTrigger());
    expect(result.current.isDismissed).toBe(false);
  });

  it("provides a dismiss function", () => {
    const { result } = renderHook(() => useScrollTrigger());
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("triggers when scrolled past threshold", () => {
    const { result } = renderHook(() => useScrollTrigger());
    // threshold = min((2000-800)*0.2, 100) = min(240, 100) = 100
    setScrollState(100, 2000, 800);
    simulateScroll();
    expect(result.current.isTriggered).toBe(true);
  });

  it("does not trigger when scrolled below threshold", () => {
    const { result } = renderHook(() => useScrollTrigger());
    setScrollState(50, 2000, 800);
    simulateScroll();
    expect(result.current.isTriggered).toBe(false);
  });

  it("uses 20% of max scroll when that is less than 100px", () => {
    const { result } = renderHook(() => useScrollTrigger());
    // page 1200px, viewport 800px → maxScroll=400, threshold=min(80, 100)=80
    setScrollState(80, 1200, 800);
    simulateScroll();
    expect(result.current.isTriggered).toBe(true);
  });

  it("does not trigger without a scroll event", () => {
    const { result } = renderHook(() => useScrollTrigger());
    setScrollState(200, 2000, 800);
    expect(result.current.isTriggered).toBe(false);
  });

  it("sets isDismissed to true when dismiss is called", () => {
    const { result } = renderHook(() => useScrollTrigger());
    setScrollState(100, 2000, 800);
    simulateScroll();
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.isDismissed).toBe(true);
  });

  it("sets isTriggered to false when dismiss is called", () => {
    const { result } = renderHook(() => useScrollTrigger());
    setScrollState(100, 2000, 800);
    simulateScroll();
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.isTriggered).toBe(false);
  });

  it("does not re-trigger after dismissal", () => {
    const { result } = renderHook(() => useScrollTrigger());
    setScrollState(100, 2000, 800);
    simulateScroll();
    act(() => {
      result.current.dismiss();
    });
    simulateScroll();
    expect(result.current.isTriggered).toBe(false);
    expect(result.current.isDismissed).toBe(true);
  });

  it("cleans up scroll listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useScrollTrigger());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    removeSpy.mockRestore();
  });
});
