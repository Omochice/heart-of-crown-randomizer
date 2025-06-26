export function isTouchEvent(event: TouchEvent | MouseEvent): event is TouchEvent {
	return "touches" in event;
}
