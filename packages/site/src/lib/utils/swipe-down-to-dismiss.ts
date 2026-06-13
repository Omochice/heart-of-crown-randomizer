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
 * The drag only engages when the scroll container is already at the top, so
 * scrolling the content downward is never hijacked. Releasing below the
 * threshold animates the sheet back into place; releasing past it leaves the
 * sheet translated so the component's own exit transition continues the motion.
 */
export const swipeDownToDismiss: Action<
  HTMLElement,
  SwipeDownToDismissOptions
> = (node, options) => {
  let current = options;
  const state = {
    startX: 0,
    startY: 0,
    deltaY: 0,
    dragging: false,
  };

  function settle(): void {
    node.style.transition = `transform ${RESET_TRANSITION_MS}ms ease-out`;
    node.style.transform = "";
    setTimeout(() => {
      if (node.isConnected) {
        node.style.transition = "";
      }
    }, RESET_TRANSITION_MS);
    state.dragging = false;
    state.deltaY = 0;
  }

  function release(): void {
    node.style.transition = "";
    node.style.transform = "";
    state.dragging = false;
    state.deltaY = 0;
  }

  function onTouchStart(event: TouchEvent): void {
    if (node.scrollTop > 0 || event.touches.length !== 1) {
      return;
    }
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

    const deltaX = event.touches[0].clientX - state.startX;
    const deltaY = event.touches[0].clientY - state.startY;

    // Upward or dominantly horizontal motion is not a dismiss gesture; hand it
    // back to the browser so scrolling and horizontal swipes still work.
    if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
      release();
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

    settle();
  }

  node.addEventListener("touchstart", onTouchStart, { passive: true });
  node.addEventListener("touchmove", onTouchMove, { passive: false });
  node.addEventListener("touchend", onTouchEnd);
  node.addEventListener("touchcancel", settle);

  return {
    update(next: SwipeDownToDismissOptions): void {
      current = next;
    },
    destroy(): void {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", settle);
    },
  };
};
