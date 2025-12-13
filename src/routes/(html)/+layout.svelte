<script lang="ts">
	import '../../white.css';
	import '../../app.css';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { ClerkProvider } from 'svelte-clerk';

	inject({ mode: dev ? 'development' : 'production' });
	
	// In SvelteKit with Svelte 5, layouts receive children as a snippet prop
	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<ClerkProvider {children} />
