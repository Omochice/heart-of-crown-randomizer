import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import AppMenu from "./AppMenu.svelte";

vi.mock("./github-issue", () => ({
  buildGitHubIssueUrl: vi.fn(
    () => "https://github.com/example/issues/new?body=test",
  ),
}));

const defaultProps = {
  selectedCardIds: [1, 2, 3],
  pinnedIds: new Set<number>(),
  excludedIds: new Set<number>(),
  constraintIds: new Set<number>(),
};

describe("AppMenu", () => {
  it("should render a menu trigger button with aria-label", () => {
    render(AppMenu, { props: defaultProps });

    const trigger = screen.getByRole("button", { name: "メニュー" });
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("should toggle the dropdown when trigger is clicked", async () => {
    render(AppMenu, { props: defaultProps });

    expect(screen.queryByRole("menu")).toBeNull();

    const trigger = screen.getByRole("button", { name: "メニュー" });
    await fireEvent.click(trigger);

    expect(screen.queryByRole("menu")).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await fireEvent.click(trigger);

    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("should contain a bug report link with target=_blank in the dropdown", async () => {
    render(AppMenu, { props: defaultProps });

    const trigger = screen.getByRole("button", { name: "メニュー" });
    await fireEvent.click(trigger);

    const link = screen.getByRole("menuitem", { name: /バグを報告/ });
    expect(link).toBeTruthy();
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("href")).toContain("github.com");
  });
});
