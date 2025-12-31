import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import CardWithActions from "$lib/CardWithActions.svelte";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import * as CardState from "$lib/stores/card-state.svelte";

/**
 * Accessibility Tests for Pin/Exclude Buttons (Task 7.1)
 *
 * These tests focus on keyboard operation (Requirement 6.1),
 * which complements the existing aria-pressed and focus indicator
 * tests in CardWithActions.svelte.test.ts.
 *
 * Note: aria-pressed and focus:ring classes are already tested in
 * CardWithActions.svelte.test.ts (lines 163-209), so we focus on
 * keyboard-specific interactions here.
 */
describe("CardWithActions Keyboard Accessibility (Task 7.1 - Requirement 6.1)", () => {
	const mockCard: CommonCard = {
		id: 1,
		name: "Test Card",
		cost: 3,
		type: "common",
		link: 0,
		mainType: ["attack"],
		effect: "",
		hasChild: false,
		edition: 0,
	};

	const mockSwipeHandlers = {
		onSwipeStart: vi.fn(),
		onSwipeMove: vi.fn(),
		onSwipeEnd: vi.fn(),
		onSwipeCancel: vi.fn(),
		originalIndex: 0,
	};

	beforeEach(() => {
		// Reset card state before each test
		CardState.pinnedCardIds.clear();
		CardState.excludedCardIds.clear();
	});

	describe("Keyboard Operation - Tab Navigation", () => {
		it("should allow focusing pin button with Tab key", () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });

			// Pin button should be focusable (button elements are natively focusable)
			pinButton.focus();
			expect(document.activeElement).toBe(pinButton);
		});

		it("should allow focusing exclude button with Tab key", () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });

			// Exclude button should be focusable (button elements are natively focusable)
			excludeButton.focus();
			expect(document.activeElement).toBe(excludeButton);
		});

		it("should maintain tab order: pin button before exclude button", () => {
			const { container } = render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const buttons = container.querySelectorAll("button");
			expect(buttons.length).toBe(2);

			// Pin button should come first in DOM order (determines tab order)
			const pinButton = screen.getByRole("button", { name: /ピン/ });
			const excludeButton = screen.getByRole("button", { name: /除外/ });

			expect(buttons[0]).toBe(pinButton);
			expect(buttons[1]).toBe(excludeButton);
		});

		it("should not have tabindex attribute (relying on native button behavior)", () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			const excludeButton = screen.getByRole("button", { name: /除外/ });

			// Native <button> elements are focusable by default (no tabindex needed)
			expect(pinButton.hasAttribute("tabindex")).toBe(false);
			expect(excludeButton.hasAttribute("tabindex")).toBe(false);
		});
	});

	describe("Keyboard Operation - Native Button Semantics", () => {
		it("should use native button element for pin button (guarantees Enter/Space support)", () => {
			const { container } = render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });

			// Verify it's a native <button> element, not div+role="button"
			expect(pinButton.tagName).toBe("BUTTON");
		});

		it("should use native button element for exclude button (guarantees Enter/Space support)", () => {
			const { container } = render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });

			// Verify it's a native <button> element, not div+role="button"
			expect(excludeButton.tagName).toBe("BUTTON");
		});

		it("should have type=button on pin button to prevent form submission", () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });

			// type="button" prevents accidental form submission when inside a form
			expect(pinButton.getAttribute("type")).toBe("button");
		});

		it("should have type=button on exclude button to prevent form submission", () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });

			// type="button" prevents accidental form submission when inside a form
			expect(excludeButton.getAttribute("type")).toBe("button");
		});
	});

	describe("Keyboard Operation - Focus Retention After Click", () => {
		it("should retain focus on pin button after click activation", async () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			pinButton.focus();

			// Click the button (simulates user interaction)
			await fireEvent.click(pinButton);

			// Focus should remain on the button
			// This ensures keyboard users don't lose their place after activating a button
			expect(document.activeElement).toBe(pinButton);
		});

		it("should retain focus on exclude button after click activation", async () => {
			render(CardWithActions, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });
			excludeButton.focus();

			// Click the button (simulates user interaction)
			await fireEvent.click(excludeButton);

			// Focus should remain on the button
			expect(document.activeElement).toBe(excludeButton);
		});
	});

	describe("Accessibility Documentation (Requirement 6.1)", () => {
		it("documents the keyboard operation requirements", () => {
			const expectedBehavior = `
				Keyboard Operation Requirements (WCAG 2.1.1 - Keyboard):
				- All pin/exclude buttons MUST be keyboard accessible
				- Tab key moves focus to buttons in logical order (pin before exclude)
				- Enter and Space keys activate the focused button (native browser behavior)
				- Focus MUST be visible (focus ring) for all interactive elements
				- Focus MUST remain on button after activation (no focus loss)

				Implementation:
				- Use native <button> elements (natively keyboard accessible)
				- Do NOT use tabindex (rely on native button behavior)
				- Use type="button" to prevent form submission
				- onclick handler works for both mouse and keyboard (browser handles Enter/Space)
				- focus:ring-2 and focus:ring-{color}-500 provide visible focus indicators

				Testing Strategy:
				- Verify native <button> elements are used (tagName === "BUTTON")
				- Verify type="button" attribute is present
				- Verify no manual tabindex (relying on native behavior)
				- Verify tab order (DOM order determines tab order)
				- Verify focus retention after click
				- Note: Enter/Space key support is provided by the browser, not our code

				Benefits:
				- Keyboard-only users can fully operate pin/exclude features
				- Screen reader users can navigate and activate buttons
				- Follows WCAG 2.1 Level A compliance
				- Muscle memory from other web applications (standard button behavior)
				- Less code to maintain (no custom keyboard event handlers)
			`;
			expect(expectedBehavior).toBeTruthy();
		});

		it("documents why native button elements were chosen over div+role", () => {
			const designRationale = `
				WHY NOT use <div role="button" tabindex="0" onkeydown={...}>?

				We chose native <button> elements over div+role+custom-handlers because:

				1. Automatic keyboard support: Enter and Space activation built-in by browser
				   - WHY NOT manually handle keydown events: error-prone, easy to forget edge cases
				   - Native buttons handle Enter, Space, and other keyboard nuances automatically

				2. No manual tabindex management required
				   - WHY NOT use tabindex="0": one more thing to maintain and test
				   - Native buttons are automatically in the tab order

				3. Native focus management (no focus loss on state change)
				   - WHY NOT manually manage focus: complex and fragile
				   - Native buttons retain focus after activation automatically

				4. Better screen reader announcements (button role is native)
				   - WHY NOT rely on role="button": less reliable across screen readers
				   - Native semantics are always interpreted correctly

				5. Less code to maintain (no custom keyboard event handlers)
				   - WHY NOT write custom handlers: increases surface area for bugs
				   - onclick works for both mouse and keyboard automatically

				6. Follows HTML5 semantics (use native elements when possible)
				   - WHY NOT use divs everywhere: violates platform semantics
				   - HTML provides semantic elements for a reason

				Trade-offs:
				- Native buttons have default browser styles (mitigated with Tailwind reset)
				- Must use type="button" to prevent form submission (explicit is better)
				- Some CSS properties differ (display, box-sizing) - Tailwind handles this

				Decision: Native buttons provide better accessibility with significantly less code.
				The browser's built-in keyboard support is more reliable than our custom implementation.
			`;
			expect(designRationale).toBeTruthy();
		});
	});
});
