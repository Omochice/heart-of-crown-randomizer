import { isTouchEvent } from "./is-touch-event";

const VERTICAL_CANCEL_PX = 100;
const TRANSITION_MS = 200;
const SWIPE_THRESHOLD = 100;

type SwipeHandlersOptions = {
	isPinned: (index: number) => boolean;
	onRemove: (index: number) => void;
};

function animateCardReset(element: HTMLElement): void {
	element.style.transition = `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`;
	element.style.transform = "";
	element.style.opacity = "";
	setTimeout(() => {
		if (element.isConnected) {
			element.style.transition = "";
		}
	}, TRANSITION_MS);
}

/**
 * Factory that produces swipe gesture handlers for card removal.
 *
 * We use a factory instead of a Svelte action because Card.svelte
 * already expects individual handler props (onSwipeStart, onSwipeMove,
 * onSwipeEnd, onSwipeCancel), and changing that interface would cascade
 * into unrelated component changes.
 */
export function createSwipeHandlers(options: SwipeHandlersOptions) {
	const swipeState = $state({
		startX: 0,
		startY: 0,
		currentX: 0,
		isDragging: false,
		cardElement: null as HTMLElement | null,
		cardIndex: -1,
	});

	function resetSwipeState(): void {
		document.removeEventListener("mousemove", handleSwipeMove);
		document.removeEventListener("mouseup", handleSwipeEnd);
		swipeState.isDragging = false;
		swipeState.cardElement = null;
		swipeState.cardIndex = -1;
	}

	function handleSwipeStart(event: TouchEvent | MouseEvent, index: number): void {
		if (options.isPinned(index)) return;

		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY;

		swipeState.startX = clientX;
		swipeState.startY = clientY;
		swipeState.currentX = clientX;
		swipeState.isDragging = true;
		swipeState.cardElement = event.currentTarget as HTMLElement;
		swipeState.cardIndex = index;

		swipeState.cardElement.style.transition = "none";

		if (!isTouchEvent(event)) {
			document.addEventListener("mousemove", handleSwipeMove);
			document.addEventListener("mouseup", handleSwipeEnd);
		}
	}

	function handleSwipeMove(event: TouchEvent | MouseEvent): void {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const deltaX = clientX - swipeState.startX;
		const deltaY = Math.abs(
			(isTouchEvent(event) ? event.touches[0].clientY : event.clientY) - swipeState.startY,
		);

		if (deltaY > VERTICAL_CANCEL_PX) {
			handleSwipeCancel();
			return;
		}

		if (
			isTouchEvent(event) &&
			event.cancelable &&
			Math.abs(deltaX) > 10 &&
			Math.abs(deltaX) > deltaY
		) {
			event.preventDefault();
		}

		swipeState.currentX = clientX;
		swipeState.cardElement.style.transform = `translate3d(${deltaX}px, 0, 0)`;
		swipeState.cardElement.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`;
	}

	function handleSwipeEnd(): void {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const deltaX = swipeState.currentX - swipeState.startX;

		if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
			options.onRemove(swipeState.cardIndex);
		} else {
			const el = swipeState.cardElement;
			if (el) {
				animateCardReset(el);
			}
		}

		resetSwipeState();
	}

	function handleSwipeCancel(): void {
		const el = swipeState.cardElement;
		if (el) {
			animateCardReset(el);
		}

		resetSwipeState();
	}

	return {
		handleSwipeStart,
		handleSwipeMove,
		handleSwipeEnd,
		handleSwipeCancel,
	};
}
