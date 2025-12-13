<script lang="ts">
	import { OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
	import AccessControl from './AccessControl.svelte';
	import { SignOutButton, SignedIn, useClerkContext } from 'svelte-clerk/client';

	const ctx = useClerkContext();
</script>

<div class="headerWrapper">
	<header>
		<a href="/" class="imageWrapper">
			<img src="/bigLogo.webp" alt="*" />
		</a>
		<h1>Sien + Co</h1>
		<OverflowMenu flipped>
			<div class="menuButton" slot="menu">☰</div>
			<SignedIn>
				<OverflowMenuItem disabled>
					{ctx.user?.firstName ?? ctx.user?.username ?? ctx.user?.emailAddresses[0]?.emailAddress ?? ''}
				</OverflowMenuItem>
			</SignedIn>
			<AccessControl>
				<OverflowMenuItem href="/shipments">Shipments</OverflowMenuItem>
				<OverflowMenuItem href="/status">Status</OverflowMenuItem>
				<OverflowMenuItem href="/charts">Charts</OverflowMenuItem>
			</AccessControl>
			<OverflowMenuItem href="/summary">Summary</OverflowMenuItem>
			<AccessControl>
				<OverflowMenuItem href="/allholds">Reserves</OverflowMenuItem>

				<OverflowMenuItem slot="else" href="/holds">Reserves</OverflowMenuItem>
			</AccessControl>
			<OverflowMenuItem danger
				><SignOutButton redirectUrl="/sign-out" /></OverflowMenuItem
			>
		</OverflowMenu>
	</header>
	<div class="wrapper"></div>
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
