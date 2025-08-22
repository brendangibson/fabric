<script lang="ts">
	import Holds from '$lib/Holds.svelte';
	import type { THold } from '$src/fabric';

	export let data: {
		holds: THold[];
	};
</script>

<Holds holds={data?.holds} />
