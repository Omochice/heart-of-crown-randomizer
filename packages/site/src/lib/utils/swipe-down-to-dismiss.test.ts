import { beforeEach, describe, expect, it, vi } from "vitest";
import { swipeDownToDismiss } from "./swipe-down-to-dismiss";

function touchEvent(
  type: string,
  options: { clientX: number; clientY: number; cancelable?: boolean },
): TouchEvent {
  return new TouchEvent(type, {
    touches: [{ clientX: options.clientX, clientY: options.clientY } as Touch],
    cancelable: options.cancelable ?? true,
    bubbles: true,
  });
}

function createNode(): HTMLElement {
  const node = document.createElement("div");
  document.body.appendChild(node);
  return node;
}

describe("swipeDownToDismiss", () => {
  let onDismiss: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    document.body.innerHTML = "";
    onDismiss = vi.fn<() => void>();
  });

  it("dismisses when dragged down past the threshold", () => {
    const node = createNode();
    swipeDownToDismiss(node, { onDismiss });

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 0, clientY: 250 }));
    node.dispatchEvent(touchEvent("touchend", { clientX: 0, clientY: 250 }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss when the drag is below the threshold", () => {
    const node = createNode();
    swipeDownToDismiss(node, { onDismiss });

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 0, clientY: 150 }));
    node.dispatchEvent(touchEvent("touchend", { clientX: 0, clientY: 150 }));

    expect(onDismiss).not.toHaveBeenCalled();
    expect(node.style.transform).toBe("");
  });

  it("hands the gesture back when the drag is dominantly horizontal", () => {
    const node = createNode();
    swipeDownToDismiss(node, { onDismiss });

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 200, clientY: 150 }));
    node.dispatchEvent(touchEvent("touchend", { clientX: 200, clientY: 150 }));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("hands the gesture back when a second finger joins mid-drag", () => {
    const node = createNode();
    swipeDownToDismiss(node, { onDismiss });

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 0, clientY: 180 }));
    expect(node.style.transform).not.toBe("");

    node.dispatchEvent(
      new TouchEvent("touchmove", {
        touches: [
          { clientX: 0, clientY: 250 } as Touch,
          { clientX: 40, clientY: 260 } as Touch,
        ],
        cancelable: true,
        bubbles: true,
      }),
    );
    node.dispatchEvent(touchEvent("touchend", { clientX: 0, clientY: 250 }));

    expect(onDismiss).not.toHaveBeenCalled();
    expect(node.style.transform).toBe("");
  });

  it("does not start a drag while the content is scrolled away from the top", () => {
    const node = createNode();
    Object.defineProperty(node, "scrollTop", { value: 40, configurable: true });
    swipeDownToDismiss(node, { onDismiss });

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 0, clientY: 250 }));
    node.dispatchEvent(touchEvent("touchend", { clientX: 0, clientY: 250 }));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("uses the latest callback after update", () => {
    const node = createNode();
    const next = vi.fn<() => void>();
    const handle = swipeDownToDismiss(node, { onDismiss });

    handle?.update?.({ onDismiss: next });

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 0, clientY: 250 }));
    node.dispatchEvent(touchEvent("touchend", { clientX: 0, clientY: 250 }));

    expect(onDismiss).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("stops reacting once destroyed", () => {
    const node = createNode();
    const handle = swipeDownToDismiss(node, { onDismiss });

    handle?.destroy?.();

    node.dispatchEvent(touchEvent("touchstart", { clientX: 0, clientY: 100 }));
    node.dispatchEvent(touchEvent("touchmove", { clientX: 0, clientY: 250 }));
    node.dispatchEvent(touchEvent("touchend", { clientX: 0, clientY: 250 }));

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
