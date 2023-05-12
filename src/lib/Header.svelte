<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import { goto } from '$app/navigation';

	const onLogout = () => async () => {
		goto('/auth/login');

		await signOut();
		localStorage.clear();
	};
</script>

<div class="headerWrapper">
	<header>
		<a href="/">
			<img src="/bigLogo.png" alt="*" />
		</a>
		<h1>Sien + Co</h1>
		<OverflowMenu flipped>
			<div class="menuButton" slot="menu">☰</div>
			<AccessControl>
				<OverflowMenuItem href="/shipments">Shipments</OverflowMenuItem>
				<OverflowMenuItem href="/status">Status</OverflowMenuItem>
			</AccessControl>
			<OverflowMenuItem href="/summary">Summary</OverflowMenuItem>
			<AccessControl>
				<OverflowMenuItem href="/allholds">Reserves</OverflowMenuItem>

				<OverflowMenuItem slot="else" href="/holds">Reserves</OverflowMenuItem>
			</AccessControl>
			<OverflowMenuItem danger on:click={onLogout()}>Log out</OverflowMenuItem>
		</OverflowMenu>
	</header>
	<div class="wrapper" />
</div>

<style>
	.headerWrapper {
		--height: 8vh;
		margin-bottom: 4vh;
	}

	header {
		height: var(--height);
		width: 90vw;
		position: fixed;
		background-color: var(--white);
		z-index: 100;
		border-bottom: 1px solid var(--grey-600);
		display: flex;
		justify-content: space-between;
	}

	img {
		width: var(--height);
		height: var(--height);
	}

	h1 {
		line-height: var(--height);
	}

	.wrapper {
		height: var(--height);
	}

	:global(header button.bx--overflow-menu) {
		font-size: 4vh;
		height: var(--height);
	}
</style>
