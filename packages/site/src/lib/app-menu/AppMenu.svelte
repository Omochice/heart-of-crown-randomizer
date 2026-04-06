<script lang="ts">
	import { EllipsisVertical, Bug } from "lucide-svelte";
	import { buildGitHubIssueUrl } from "./github-issue";

	type Props = {
		selectedCardIds: number[];
		pinnedIds: ReadonlySet<number>;
		excludedIds: ReadonlySet<number>;
		constraintIds: ReadonlySet<number>;
	};

	let { selectedCardIds, pinnedIds, excludedIds, constraintIds }: Props = $props();
	let isOpen = $state(false);
	let menuElement: HTMLDivElement | undefined = $state();

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
		if (!isOpen) return;

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
		onclick={toggle}
	>
		<EllipsisVertical size={18} />
	</button>

	{#if isOpen}
		<div
			class="app-menu-dropdown"
			role="menu"
		>
			<a
				class="app-menu-item"
				role="menuitem"
				href={issueUrl}
				target="_blank"
				rel="noopener noreferrer"
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
