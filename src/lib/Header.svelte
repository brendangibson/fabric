<script lang="ts">
	import { OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import { goto } from '$app/navigation';
	import SignOutButton from 'clerk-sveltekit/client/SignOutButton.svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
</script>

<div class="headerWrapper">
	<header>
		<a href="/" class="imageWrapper">
			<img src="/bigLogo.webp" alt="*" />
		</a>
		<h1>Sien + Co</h1>
		<OverflowMenu flipped>
			<div class="menuButton" slot="menu">☰</div>
			<SignedIn let:user>
				<OverflowMenuItem disabled>
					{user?.firstName ?? user?.username ?? user?.emailAddresses}
				</OverflowMenuItem>
			</SignedIn>
			<AccessControl>
				<OverflowMenuItem href="/shipments">Shipments</OverflowMenuItem>
				<OverflowMenuItem href="/status">Status</OverflowMenuItem>
			</AccessControl>
			<OverflowMenuItem href="/summary">Summary</OverflowMenuItem>
			<AccessControl>
				<OverflowMenuItem href="/allholds">Reserves</OverflowMenuItem>

				<OverflowMenuItem slot="else" href="/holds">Reserves</OverflowMenuItem>
			</AccessControl>
			<OverflowMenuItem danger
				><SignOutButton
					signOutCallback={() => {
						goto('/sign-out');
					}}
				/></OverflowMenuItem
			>
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
		align-items: center;
	}

	.imageWrapper {
		display: flex;
		align-items: center;
		width: var(--height);
		height: var(--height);
	}

	img {
		height: 80%;
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
