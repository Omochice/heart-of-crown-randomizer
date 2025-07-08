import type { SwipeState, SwipeHandlers } from "./types.js";

export function isTouchEvent(event: TouchEvent | MouseEvent): event is TouchEvent {
  return "touches" in event;
}

export function createSwipeHandler(
  onCardRemove: (index: number) => void,
  threshold = 100
): SwipeHandlers {
  const swipeState: SwipeState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    cardElement: null,
    cardIndex: -1,
    threshold,
  };

  function handleSwipeStart(event: TouchEvent | MouseEvent, index: number) {
    const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
    const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY;

    swipeState.startX = clientX;
    swipeState.startY = clientY;
    swipeState.currentX = clientX;
    swipeState.isDragging = true;
    swipeState.cardElement = event.currentTarget as HTMLElement;
    swipeState.cardIndex = index;

    // For mouse events, listen at document level
    if (!isTouchEvent(event)) {
      document.addEventListener("mousemove", handleSwipeMove);
      document.addEventListener("mouseup", handleSwipeEnd);
    }
  }

  function handleSwipeMove(event: TouchEvent | MouseEvent) {
    if (!swipeState.isDragging || !swipeState.cardElement) return;

    const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
    const deltaX = clientX - swipeState.startX;
    const deltaY = Math.abs(
      (isTouchEvent(event) ? event.touches[0].clientY : event.clientY) - swipeState.startY
    );

    // Cancel swipe if vertical movement is too large
    if (deltaY > 50) {
      handleSwipeCancel();
      return;
    }

    swipeState.currentX = clientX;

    // Update card position
    swipeState.cardElement.style.transform = `translateX(${deltaX}px)`;
    swipeState.cardElement.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`;
  }

  function handleSwipeEnd() {
    if (!swipeState.isDragging || !swipeState.cardElement) return;

    const deltaX = swipeState.currentX - swipeState.startX;

    // Delete card if threshold exceeded
    if (Math.abs(deltaX) > swipeState.threshold) {
      onCardRemove(swipeState.cardIndex);
      handleSwipeCancel();
    } else {
      // Return to original position
      swipeState.cardElement.style.transform = "";
      swipeState.cardElement.style.opacity = "";
    }

    // Clean up event listeners
    document.removeEventListener("mousemove", handleSwipeMove);
    document.removeEventListener("mouseup", handleSwipeEnd);

    swipeState.isDragging = false;
  }

  function handleSwipeCancel() {
    if (swipeState.cardElement) {
      swipeState.cardElement.style.transform = "";
      swipeState.cardElement.style.opacity = "";
    }

    document.removeEventListener("mousemove", handleSwipeMove);
    document.removeEventListener("mouseup", handleSwipeEnd);

    swipeState.isDragging = false;
    swipeState.cardElement = null;
    swipeState.cardIndex = -1;
  }

  return {
    onSwipeStart: handleSwipeStart,
    onSwipeMove: handleSwipeMove,
    onSwipeEnd: handleSwipeEnd,
    onSwipeCancel: handleSwipeCancel,
  };
}