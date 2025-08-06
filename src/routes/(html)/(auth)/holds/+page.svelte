<script lang="ts">
	import Holds from '$lib/Holds.svelte';
	import type { THold } from '../../../fabric';

	export let data: {
		holds: THold[];
	};
</script>

<Holds holds={data?.holds} />
