<script lang="ts">
	export let diameter: number;
	export let weight: number;
	export let length: number;
</script>

<div class="dimensionIcon">
	<div class="leftEnd">
		<div class="core" />
	</div>
	<div class="body">
		{#if diameter}
			<div class="diameter">
				<span class="vertArrows">↕ </span>
				{diameter.toFixed(1)} in
			</div>
		{/if}
		{#if weight}
			<div class="weight">{weight.toFixed(1)} lbs</div>
		{/if}
		{#if length}
			<div class="length">
				in <span class="horizArrows">↔</span>
			</div>
		{/if}
	</div>
	<div class="rightEnd" />
</div>

<style>
	.dimensionIcon {
		--height: 100px;
		position: relative;
		width: 100%;
	}

	.leftEnd {
		position: absolute;
		border-radius: 50%;
		border: 1px dashed black;
		height: var(--height);
		width: calc(var(--height) / 2);
		transform: translateX(-50%);
		left: 0;
		z-index: 1;
	}

	.core {
		background: black;
		border-radius: 50%;
		position: absolute;
		transform: translate(-50%, -50%);
		left: 50%;
		top: 50%;
		height: calc(var(--height) / 5);
		width: calc(var(--height) / 10);
		z-index: 2;
	}

	.body {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		border-top: 1px dashed black;
		border-bottom: 1px dashed black;
		background: white;
		height: var(--height);
	}

	.rightEnd {
		position: absolute;
		border-radius: 50%;
		border: 1px dashed black;
		height: var(--height);
		width: calc(var(--height) / 2);
		transform: translateX(50%);
		right: 0;
		z-index: -1;
	}

	.diameter {
		position: absolute;
		top: 50%;
		left: calc(var(--height) / 3);
		transform: translateY(-50%);
	}

	.length {
		position: absolute;
		left: 50%;
		top: 105%;
		transform: translateX(-50%);
	}

	.weight {
		position: absolute;
		left: 70%;
		top: 50%;
		transform: translateY(-50%);
		font-weight: bold;
	}

	.vertArrows {
		color: red;
	}

	.horizArrows {
		color: red;
	}
</style>
