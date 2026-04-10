<script lang="ts">
	import { Bug, EllipsisVertical } from "lucide-svelte";
	import { buildGitHubIssueUrl } from "./github-issue";

	type Props = {
		/** IDs of currently selected cards */
		selectedCardIds: number[];
		/** IDs of pinned cards */
		pinnedIds: ReadonlySet<number>;
		/** IDs of excluded cards */
		excludedIds: ReadonlySet<number>;
		/** IDs of enabled constraints */
		constraintIds: ReadonlySet<number>;
	};

	let { selectedCardIds, pinnedIds, excludedIds, constraintIds }: Props = $props();
	let isOpen = $state(false);
	let menuElement: HTMLDivElement | undefined = $state();
	let dropdownElement: HTMLDivElement | undefined = $state();
	const dropdownId = "app-menu-dropdown";

	const issueUrl = $derived(
		isOpen
			? buildGitHubIssueUrl({
					origin: window.location.origin + window.location.pathname,
					selectedCardIds,
					pinnedIds,
					excludedIds,
					constraintIds,
				})
			: "",
	);

	function toggle() {
		isOpen = !isOpen;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && isOpen) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (!isOpen || !dropdownElement) {
			return;
		}
		const firstItem = dropdownElement.querySelector<HTMLElement>("[role=menuitem]");
		firstItem?.focus();
	});

	$effect(() => {
		if (!isOpen) {
			return;
		}

		function handleClickOutside(event: MouseEvent) {
			if (menuElement && !menuElement.contains(event.target as Node)) {
				isOpen = false;
			}
		}

		document.addEventListener("click", handleClickOutside, true);
		return () => document.removeEventListener("click", handleClickOutside, true);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="app-menu"
	bind:this={menuElement}
>
	<button
		class="app-menu-trigger"
		aria-label="メニュー"
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-controls={dropdownId}
		onclick={toggle}
	>
		<EllipsisVertical size={18} />
	</button>

	{#if isOpen}
		<div
			class="app-menu-dropdown"
			id={dropdownId}
			role="menu"
			bind:this={dropdownElement}
		>
			<a
				class="app-menu-item"
				role="menuitem"
				href={issueUrl}
				target="_blank"
				rel="noopener noreferrer"
				onclick={() => (isOpen = false)}
			>
				<Bug size={16} />
				<span>バグを報告</span>
			</a>
		</div>
	{/if}
</div>

<style>
	.app-menu {
		position: relative;
		display: inline-block;
	}

	.app-menu-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--border-default);
		border-radius: 50%;
		background: var(--bg-primary);
		cursor: pointer;
		padding: 0;
	}

	.app-menu-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		min-width: 180px;
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		border: 1px solid var(--border-default);
		background: var(--bg-card);
		z-index: 100;
	}

	.app-menu-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		color: var(--text-primary);
		text-decoration: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.app-menu-item:hover {
		background: var(--bg-primary);
	}
</style>
