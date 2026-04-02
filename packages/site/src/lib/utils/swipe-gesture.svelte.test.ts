import type { Mock } from "vitest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createSwipeHandlers } from "./swipe-gesture.svelte";

function createMockMouseEvent(
	type: string,
	options: { clientX: number; clientY: number },
): MouseEvent {
	return new MouseEvent(type, {
		clientX: options.clientX,
		clientY: options.clientY,
		bubbles: true,
	});
}

function createMockTouchEvent(
	type: string,
	options: { clientX: number; clientY: number; cancelable?: boolean },
): TouchEvent {
	return new TouchEvent(type, {
		touches: [{ clientX: options.clientX, clientY: options.clientY } as Touch],
		cancelable: options.cancelable ?? true,
		bubbles: true,
	});
}

function createMockElement(): HTMLElement {
	const el = document.createElement("div");
	document.body.appendChild(el);
	return el;
}

describe("createSwipeHandlers", () => {
	let isPinned: Mock<(index: number) => boolean>;
	let onRemove: Mock<(index: number) => void>;

	beforeEach(() => {
		isPinned = vi.fn<(index: number) => boolean>().mockReturnValue(false);
		onRemove = vi.fn<(index: number) => void>();
	});

	it("should return four handler functions", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });

		expect(handlers.handleSwipeStart).toBeTypeOf("function");
		expect(handlers.handleSwipeMove).toBeTypeOf("function");
		expect(handlers.handleSwipeEnd).toBeTypeOf("function");
		expect(handlers.handleSwipeCancel).toBeTypeOf("function");
	});

	it("should not start swiping when card is pinned", () => {
		isPinned.mockReturnValue(true);
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const event = createMockMouseEvent("mousedown", { clientX: 100, clientY: 200 });
		Object.defineProperty(event, "currentTarget", { value: el });

		handlers.handleSwipeStart(event, 0);
		handlers.handleSwipeMove(createMockMouseEvent("mousemove", { clientX: 250, clientY: 200 }));
		handlers.handleSwipeEnd();

		expect(onRemove).not.toHaveBeenCalled();
	});

	it("should call onRemove when swiped past threshold with mouse", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const startEvent = createMockMouseEvent("mousedown", { clientX: 100, clientY: 200 });
		Object.defineProperty(startEvent, "currentTarget", { value: el });

		handlers.handleSwipeStart(startEvent, 2);
		handlers.handleSwipeMove(createMockMouseEvent("mousemove", { clientX: 250, clientY: 200 }));
		handlers.handleSwipeEnd();

		expect(onRemove).toHaveBeenCalledWith(2);
	});

	it("should not call onRemove when swipe is below threshold", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const startEvent = createMockMouseEvent("mousedown", { clientX: 100, clientY: 200 });
		Object.defineProperty(startEvent, "currentTarget", { value: el });

		handlers.handleSwipeStart(startEvent, 1);
		handlers.handleSwipeMove(createMockMouseEvent("mousemove", { clientX: 150, clientY: 200 }));
		handlers.handleSwipeEnd();

		expect(onRemove).not.toHaveBeenCalled();
	});

	it("should cancel swipe when vertical movement exceeds threshold", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const startEvent = createMockMouseEvent("mousedown", { clientX: 100, clientY: 200 });
		Object.defineProperty(startEvent, "currentTarget", { value: el });

		handlers.handleSwipeStart(startEvent, 0);
		handlers.handleSwipeMove(createMockMouseEvent("mousemove", { clientX: 250, clientY: 350 }));
		handlers.handleSwipeEnd();

		expect(onRemove).not.toHaveBeenCalled();
	});

	it("should call onRemove for left swipe past threshold", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const startEvent = createMockMouseEvent("mousedown", { clientX: 300, clientY: 200 });
		Object.defineProperty(startEvent, "currentTarget", { value: el });

		handlers.handleSwipeStart(startEvent, 3);
		handlers.handleSwipeMove(createMockMouseEvent("mousemove", { clientX: 100, clientY: 200 }));
		handlers.handleSwipeEnd();

		expect(onRemove).toHaveBeenCalledWith(3);
	});

	it("should reset card style on cancel", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const startEvent = createMockMouseEvent("mousedown", { clientX: 100, clientY: 200 });
		Object.defineProperty(startEvent, "currentTarget", { value: el });

		handlers.handleSwipeStart(startEvent, 0);
		handlers.handleSwipeCancel();

		expect(onRemove).not.toHaveBeenCalled();
	});

	it("should work with touch events", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });
		const el = createMockElement();

		const startEvent = createMockTouchEvent("touchstart", { clientX: 100, clientY: 200 });
		Object.defineProperty(startEvent, "currentTarget", { value: el });

		handlers.handleSwipeStart(startEvent, 0);
		handlers.handleSwipeMove(createMockTouchEvent("touchmove", { clientX: 250, clientY: 200 }));
		handlers.handleSwipeEnd();

		expect(onRemove).toHaveBeenCalledWith(0);
	});

	it("should do nothing on move/end when not dragging", () => {
		const handlers = createSwipeHandlers({ isPinned, onRemove });

		handlers.handleSwipeMove(createMockMouseEvent("mousemove", { clientX: 250, clientY: 200 }));
		handlers.handleSwipeEnd();

		expect(onRemove).not.toHaveBeenCalled();
	});
});
