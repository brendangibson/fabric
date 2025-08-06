<script lang="ts">
	import AllHolds from '$lib/AllHolds.svelte';
	import type { THold } from '$src/fabric';

	export let data: {
		holds: THold[];
	};
</script>

<AllHolds holds={data?.holds} />
