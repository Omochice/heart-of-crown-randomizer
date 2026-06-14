import type { Action } from "svelte/action";

const DISMISS_THRESHOLD_PX = 100;
const RESET_TRANSITION_MS = 200;

type SwipeDownToDismissOptions = {
  /** Invoked once the sheet is dragged down far enough to dismiss it. */
  onDismiss: () => void;
};

/**
 * Lets a bottom sheet be closed with a downward swipe.
 *
 * Touch-only by design. It engages only when the scroll container is at the top
 * so content scrolling is never hijacked, and past the threshold it leaves the
 * sheet translated so the component's exit transition continues the motion.
 * Pointer and keyboard users dismiss via the backdrop, close button, or Escape.
 */
export const swipeDownToDismiss: Action<
  HTMLElement,
  SwipeDownToDismissOptions
> = (node, options) => {
  let current = options;
  // A stale snap-back timeout firing mid-animation would clear `transition` and
  // cut a later snap-back short, so it is cleared on each reset and touch start.
  let resetTimeoutId: ReturnType<typeof setTimeout> | undefined;
  const state = {
    startX: 0,
    startY: 0,
    deltaY: 0,
    dragging: false,
  };

  function clearResetTimeout(): void {
    if (resetTimeoutId !== undefined) {
      clearTimeout(resetTimeoutId);
      resetTimeoutId = undefined;
    }
  }

  // `animate` springs the sheet back (release below threshold, or cancel); the
  // instant path hands the gesture back to the browser mid-drag.
  function resetDrag(animate: boolean): void {
    clearResetTimeout();
    if (animate) {
      node.style.transition = `transform ${RESET_TRANSITION_MS}ms ease-out`;
      resetTimeoutId = setTimeout(() => {
        resetTimeoutId = undefined;
        if (node.isConnected) {
          node.style.transition = "";
        }
      }, RESET_TRANSITION_MS);
    } else {
      node.style.transition = "";
    }
    node.style.transform = "";
    state.dragging = false;
    state.deltaY = 0;
  }

  function onTouchCancel(): void {
    if (!state.dragging) {
      return;
    }
    resetDrag(true);
  }

  function onTouchStart(event: TouchEvent): void {
    if (node.scrollTop > 0 || event.touches.length !== 1) {
      return;
    }
    clearResetTimeout();
    state.startX = event.touches[0].clientX;
    state.startY = event.touches[0].clientY;
    state.deltaY = 0;
    state.dragging = true;
    node.style.transition = "none";
  }

  function onTouchMove(event: TouchEvent): void {
    if (!state.dragging) {
      return;
    }

    // A second finger mid-drag is a pinch, not a dismiss; hand it back.
    if (event.touches.length !== 1) {
      resetDrag(false);
      return;
    }

    const deltaX = event.touches[0].clientX - state.startX;
    const deltaY = event.touches[0].clientY - state.startY;

    // Upward or dominantly horizontal motion is not a dismiss; hand it back so
    // scrolling and horizontal swipes still work.
    if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
      resetDrag(false);
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    state.deltaY = deltaY;
    node.style.transform = `translate3d(0, ${deltaY}px, 0)`;
  }

  function onTouchEnd(): void {
    if (!state.dragging) {
      return;
    }

    if (state.deltaY > DISMISS_THRESHOLD_PX) {
      // Keep the translation so the exit transition continues from here.
      state.dragging = false;
      current.onDismiss();
      return;
    }

    resetDrag(true);
  }

  node.addEventListener("touchstart", onTouchStart, { passive: true });
  node.addEventListener("touchmove", onTouchMove, { passive: false });
  node.addEventListener("touchend", onTouchEnd);
  node.addEventListener("touchcancel", onTouchCancel);

  return {
    update(next: SwipeDownToDismissOptions): void {
      current = next;
    },
    destroy(): void {
      clearResetTimeout();
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", onTouchCancel);
    },
  };
};
