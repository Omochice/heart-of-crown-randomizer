import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { SwipeConfiguration, SwipeEventHandler, CardRemovalHandler } from "../types/index.js";
import { SwipeHandler } from "./swipe-handler.js";

// Mock DOM elements
const createMockElement = () => ({
  style: {
    transform: "",
    opacity: "",
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

// Mock events
const createMockTouchEvent = (clientX: number, clientY: number): TouchEvent => ({
  type: "touchstart",
  touches: [{ clientX, clientY }],
  currentTarget: createMockElement(),
  preventDefault: vi.fn(),
} as any);

const createMockMouseEvent = (clientX: number, clientY: number): MouseEvent => ({
  type: "mousedown",
  clientX,
  clientY,
  currentTarget: createMockElement(),
  preventDefault: vi.fn(),
} as any);

describe("SwipeHandler", () => {
  let swipeHandler: SwipeHandler;
  let mockRemovalHandler: CardRemovalHandler;
  let mockEventHandler: SwipeEventHandler;
  let mockElement: any;

  beforeEach(() => {
    mockRemovalHandler = vi.fn();
    mockEventHandler = vi.fn();
    mockElement = createMockElement();
    
    // Mock document event listeners with vi.spyOn
    vi.spyOn(document, 'addEventListener').mockImplementation(vi.fn());
    vi.spyOn(document, 'removeEventListener').mockImplementation(vi.fn());
    
    swipeHandler = new SwipeHandler(mockRemovalHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with default configuration", () => {
      expect(swipeHandler.threshold).toBe(100);
    });

    it("should create instance with custom configuration", () => {
      const config: SwipeConfiguration = {
        threshold: 150,
        verticalCancelThreshold: 30,
        opacityTransition: false,
        animationDuration: 300,
      };
      
      const customHandler = new SwipeHandler(mockRemovalHandler, config);
      expect(customHandler.threshold).toBe(150);
    });

    it("should freeze configuration to prevent mutation", () => {
      const config: SwipeConfiguration = {
        threshold: 150,
        verticalCancelThreshold: 30,
        opacityTransition: true,
        animationDuration: 300,
      };
      
      const handler = new SwipeHandler(mockRemovalHandler, config);
      expect(() => {
        (handler as any).config.threshold = 200;
      }).toThrow();
    });
  });

  describe("onSwipeStart", () => {
    it("should handle touch event start", () => {
      const touchEvent = createMockTouchEvent(100, 200);
      
      swipeHandler.onSwipeStart(touchEvent, 0);
      
      expect(mockEventHandler).not.toHaveBeenCalled(); // No event handler set yet
    });

    it("should handle mouse event start", () => {
      const mouseEvent = createMockMouseEvent(100, 200);
      
      swipeHandler.onSwipeStart(mouseEvent, 0);
      
      expect(document.addEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith("mouseup", expect.any(Function));
    });

    it("should store initial position and card index", () => {
      const touchEvent = createMockTouchEvent(100, 200);
      swipeHandler.addEventListener("swipe", mockEventHandler);
      
      swipeHandler.onSwipeStart(touchEvent, 5);
      
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: "start",
        cardIndex: 5,
        deltaX: 0,
        deltaY: 0,
        threshold: 100,
        shouldDelete: false,
      });
    });

    it("should prevent multiple simultaneous swipes", () => {
      const touchEvent1 = createMockTouchEvent(100, 200);
      const touchEvent2 = createMockTouchEvent(150, 250);
      
      swipeHandler.onSwipeStart(touchEvent1, 0);
      swipeHandler.onSwipeStart(touchEvent2, 1);
      
      // Second swipe should be ignored
      swipeHandler.addEventListener("swipe", mockEventHandler);
      expect(mockEventHandler).toHaveBeenCalledTimes(0);
    });
  });

  describe("onSwipeMove", () => {
    beforeEach(() => {
      const touchEvent = createMockTouchEvent(100, 200);
      touchEvent.currentTarget = mockElement;
      swipeHandler.onSwipeStart(touchEvent, 0);
    });

    it("should update element transform and opacity", () => {
      const moveEvent = createMockTouchEvent(150, 200);
      
      swipeHandler.onSwipeMove(moveEvent);
      
      expect(mockElement.style.transform).toBe("translateX(50px)");
      expect(mockElement.style.opacity).toBeTruthy();
    });

    it("should emit move event with correct delta", () => {
      swipeHandler.addEventListener("swipe", mockEventHandler);
      const moveEvent = createMockTouchEvent(150, 200);
      
      swipeHandler.onSwipeMove(moveEvent);
      
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: "move",
        cardIndex: 0,
        deltaX: 50,
        deltaY: 0,
        threshold: 100,
        shouldDelete: false,
      });
    });

    it("should cancel swipe if vertical movement exceeds threshold", () => {
      swipeHandler.addEventListener("swipe", mockEventHandler);
      const moveEvent = createMockTouchEvent(110, 260); // Large Y movement
      
      swipeHandler.onSwipeMove(moveEvent);
      
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: "cancel",
        cardIndex: 0,
        deltaX: 10,
        deltaY: 60,
        threshold: 100,
        shouldDelete: false,
      });
    });

    it("should handle mouse events", () => {
      const mouseEvent = createMockMouseEvent(150, 200);
      
      swipeHandler.onSwipeMove(mouseEvent);
      
      expect(mockElement.style.transform).toBe("translateX(50px)");
    });

    it("should ignore move events when not swiping", () => {
      const handler = new SwipeHandler(mockRemovalHandler);
      handler.addEventListener("swipe", mockEventHandler);
      const moveEvent = createMockTouchEvent(150, 200);
      
      handler.onSwipeMove(moveEvent);
      
      expect(mockEventHandler).not.toHaveBeenCalled();
    });

    it("should calculate opacity based on distance", () => {
      const config: SwipeConfiguration = {
        threshold: 100,
        verticalCancelThreshold: 50,
        opacityTransition: true,
        animationDuration: 200,
      };
      const handler = new SwipeHandler(mockRemovalHandler, config);
      const touchEvent = createMockTouchEvent(100, 200);
      touchEvent.currentTarget = mockElement;
      handler.onSwipeStart(touchEvent, 0);
      
      const moveEvent = createMockTouchEvent(150, 200); // 50px movement
      handler.onSwipeMove(moveEvent);
      
      expect(mockElement.style.opacity).toBeTruthy();
      expect(parseFloat(mockElement.style.opacity)).toBeLessThan(1);
    });
  });

  describe("onSwipeEnd", () => {
    beforeEach(() => {
      const touchEvent = createMockTouchEvent(100, 200);
      touchEvent.currentTarget = mockElement;
      swipeHandler.onSwipeStart(touchEvent, 3);
    });

    it("should trigger card removal when threshold exceeded", () => {
      const moveEvent = createMockTouchEvent(220, 200); // 120px movement
      swipeHandler.onSwipeMove(moveEvent);
      
      swipeHandler.onSwipeEnd();
      
      expect(mockRemovalHandler).toHaveBeenCalledWith(3);
    });

    it("should return to original position when threshold not exceeded", () => {
      const moveEvent = createMockTouchEvent(150, 200); // 50px movement
      swipeHandler.onSwipeMove(moveEvent);
      
      swipeHandler.onSwipeEnd();
      
      expect(mockElement.style.transform).toBe("");
      expect(mockElement.style.opacity).toBe("");
      expect(mockRemovalHandler).not.toHaveBeenCalled();
    });

    it("should emit end event with correct data", () => {
      swipeHandler.addEventListener("swipe", mockEventHandler);
      const moveEvent = createMockTouchEvent(220, 200);
      swipeHandler.onSwipeMove(moveEvent);
      
      swipeHandler.onSwipeEnd();
      
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: "end",
        cardIndex: 3,
        deltaX: 120,
        deltaY: 0,
        threshold: 100,
        shouldDelete: true,
      });
    });

    it("should clean up mouse event listeners", () => {
      const mouseEvent = createMockMouseEvent(100, 200);
      mouseEvent.currentTarget = mockElement;
      const handler = new SwipeHandler(mockRemovalHandler);
      handler.onSwipeStart(mouseEvent, 0);
      
      handler.onSwipeEnd();
      
      expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", expect.any(Function));
    });

    it("should ignore end event when not swiping", () => {
      const handler = new SwipeHandler(mockRemovalHandler);
      handler.addEventListener("swipe", mockEventHandler);
      
      handler.onSwipeEnd();
      
      expect(mockEventHandler).not.toHaveBeenCalled();
      expect(mockRemovalHandler).not.toHaveBeenCalled();
    });
  });

  describe("onSwipeCancel", () => {
    beforeEach(() => {
      const touchEvent = createMockTouchEvent(100, 200);
      touchEvent.currentTarget = mockElement;
      swipeHandler.onSwipeStart(touchEvent, 0);
    });

    it("should reset element styles", () => {
      const moveEvent = createMockTouchEvent(150, 200);
      swipeHandler.onSwipeMove(moveEvent);
      
      swipeHandler.onSwipeCancel();
      
      expect(mockElement.style.transform).toBe("");
      expect(mockElement.style.opacity).toBe("");
    });

    it("should emit cancel event", () => {
      swipeHandler.addEventListener("swipe", mockEventHandler);
      
      swipeHandler.onSwipeCancel();
      
      expect(mockEventHandler).toHaveBeenCalledWith({
        type: "cancel",
        cardIndex: 0,
        deltaX: 0,
        deltaY: 0,
        threshold: 100,
        shouldDelete: false,
      });
    });

    it("should clean up event listeners", () => {
      const mouseEvent = createMockMouseEvent(100, 200);
      mouseEvent.currentTarget = mockElement;
      const handler = new SwipeHandler(mockRemovalHandler);
      handler.onSwipeStart(mouseEvent, 0);
      
      handler.onSwipeCancel();
      
      expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", expect.any(Function));
    });
  });

  describe("event system", () => {
    it("should add and remove event listeners", () => {
      swipeHandler.addEventListener("swipe", mockEventHandler);
      
      const touchEvent = createMockTouchEvent(100, 200);
      swipeHandler.onSwipeStart(touchEvent, 0);
      
      expect(mockEventHandler).toHaveBeenCalled();
      
      swipeHandler.removeEventListener("swipe", mockEventHandler);
      vi.clearAllMocks();
      
      swipeHandler.onSwipeStart(touchEvent, 1);
      expect(mockEventHandler).not.toHaveBeenCalled();
    });

    it("should handle multiple event listeners", () => {
      const mockEventHandler2 = vi.fn();
      swipeHandler.addEventListener("swipe", mockEventHandler);
      swipeHandler.addEventListener("swipe", mockEventHandler2);
      
      const touchEvent = createMockTouchEvent(100, 200);
      swipeHandler.onSwipeStart(touchEvent, 0);
      
      expect(mockEventHandler).toHaveBeenCalled();
      expect(mockEventHandler2).toHaveBeenCalled();
    });
  });

  describe("destroy", () => {
    it("should clean up all resources", () => {
      const touchEvent = createMockTouchEvent(100, 200);
      touchEvent.currentTarget = mockElement;
      swipeHandler.onSwipeStart(touchEvent, 0);
      swipeHandler.addEventListener("swipe", mockEventHandler);
      
      swipeHandler.destroy();
      
      // Should clean up event listeners
      expect(document.removeEventListener).toHaveBeenCalled();
      
      // Should not respond to events after destroy
      vi.clearAllMocks();
      swipeHandler.onSwipeStart(touchEvent, 1);
      expect(mockEventHandler).not.toHaveBeenCalled();
    });

    it("should be safe to call multiple times", () => {
      expect(() => {
        swipeHandler.destroy();
        swipeHandler.destroy();
      }).not.toThrow();
    });
  });
});