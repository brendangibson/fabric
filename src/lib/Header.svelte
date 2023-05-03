<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';

	import { SideNav, SideNavItems, SideNavLink } from 'carbon-components-svelte';

	const isTrade = true;
	let isOpen = false;

	const onLogout = () => () => {
		signOut();
		localStorage.clear();
	};
</script>

<div class="headerWrapper">
	<header>
		<a href="/">
			<img src="/bigLogo.png" alt="*" />
		</a>
		<h1>Sien + Co</h1>
		<SideNav bind:isOpen>
			<SideNavItems>
				{#if isTrade}
					<SideNavLink href="/shipments">Shipments</SideNavLink>
				{/if}
				{#if !isTrade}
					<SideNavLink href="/status">Status</SideNavLink>
				{/if}
				<SideNavLink href="/summary">Summary</SideNavLink>
				<SideNavLink href="/holds">Holds</SideNavLink>
				<SideNavLink on:click={onLogout()}>Log out</SideNavLink>
			</SideNavItems>
		</SideNav>
	</header>
	<div class="wrapper" />
</div>

<style>
	.headerWrapper {
		--height: 8vh;
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
</style>
