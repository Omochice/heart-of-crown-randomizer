import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CardDetail from "./CardDetail.svelte";

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

const sheetRect = {
  left: 100,
  top: 100,
  right: 300,
  bottom: 500,
  width: 200,
  height: 400,
  x: 100,
  y: 100,
  toJSON: () => ({}),
} satisfies DOMRect;

function renderSheet(onClose: () => void): HTMLDialogElement {
  const { container } = render(CardDetail, {
    props: { card: mockCard, onClose },
  });
  const dialog = container.querySelector("dialog");
  if (dialog === null) {
    throw new Error("dialog was not rendered");
  }
  // jsdom does not lay elements out, so pin a known rect for the bounds check.
  dialog.getBoundingClientRect = () => sheetRect;
  return dialog;
}

describe("CardDetail backdrop dismissal", () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;
  const originalAnimate = Element.prototype.animate;

  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom does not implement modal dialogs; emulate just the open state the
    // component relies on so onMount does not throw.
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function close() {
      this.open = false;
    };
    // jsdom lacks the Web Animations API that Svelte's fly/fade transitions use.
    Element.prototype.animate = () =>
      ({
        cancel() {},
        pause() {},
        play() {},
        finished: Promise.resolve(),
        onfinish: null,
        currentTime: 0,
        startTime: 0,
      }) as unknown as Animation;
  });

  afterEach(() => {
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
    Element.prototype.animate = originalAnimate;
  });

  it("dismisses when the click lands outside the sheet bounds", async () => {
    const onClose = vi.fn<() => void>();
    const dialog = renderSheet(onClose);

    await fireEvent.click(dialog, { clientX: 10, clientY: 10 });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not dismiss when the click lands on the sheet's own padding", async () => {
    const onClose = vi.fn<() => void>();
    const dialog = renderSheet(onClose);

    await fireEvent.click(dialog, { clientX: 200, clientY: 200 });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("dismisses once when the close button is clicked, not twice via the dialog handler", async () => {
    const onClose = vi.fn<() => void>();
    renderSheet(onClose);

    await fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
