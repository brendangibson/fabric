<script lang="ts">
	import { humanize } from '../dataFunctions/cuts';
	import { getUrl } from './Swatch.svelte';

	export let originalLength: number;
	export let swatchUrl: string;
	export let remaining: number;
	export let glenRavenId: string;

	const url = getUrl(swatchUrl);

	const coreHeight = 3;

	const getHeight = (length: number) => {
		return 20 * (length / 30) + coreHeight;
	};

	const height = getHeight(remaining) + 'vw';
	const endWidth = getHeight(remaining) / 2 + 'vw';
</script>

<div class="rollIcon">
	<div
		class="fabric"
		style={`background-image: linear-gradient(to bottom, rgba(0,0,0,0.26) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0.32) 100%), url('${url}'); height:${height}; width: calc(70% + ${
			getHeight(remaining) / 2
		}vw)
        `}
	>
		<div
			class="end"
			style={`background-image:
					radial-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.1),rgba(0,0,0,0.5),rgba(0,0,0,0.1)), url('${url}'); transform: translateX(-${
						getHeight(remaining) / 4
					}vw);  height:${height}; width: ${endWidth}`}
		>
			<div class="core" style={`height: ${coreHeight}vw; width: ${coreHeight / 2}vw`} />
		</div>
		<div class="label">{glenRavenId}</div>
		<div class="a" style={`width: ${endWidth};`}>
			<div
				class="b"
				style={`transform: translateX(-${
					getHeight(remaining) / 4
				}vw); width: ${endWidth};  height:${height};`}
			/>
		</div>
		<div class="c" />
	</div>
	<div class="data">
		{humanize(remaining)}/{originalLength} yard{originalLength === 1 ? '' : 's'}
	</div>
</div>

<style>
	.rollIcon {
		padding: 5vw 10vw;
	}

	.fabric {
		display: inline-block;
		text-align: center;
		background-repeat: repeat;
		background-size: contain;
		position: relative;
	}

	.end {
		border-radius: 50%;
		background-size: 1vw;
		position: absolute;
		left: 0;
		z-index: 1;
	}

	.core {
		position: absolute;
		background: #333;
		transform: translateX(-50%) translateY(-50%);
		top: 50%;
		left: 50%;
		border-radius: 50%;
	}

	.label {
		background-color: #fff;
		color: #000;
		border: 1px dashed black;
		display: inline-block;
		padding: 1vw;
		position: absolute;
		transform: translate(-50%, -50%);
		top: 50%;
		left: 50%;
		z-index: 1;
	}

	.a {
		overflow: hidden;
		right: -1px;
		top: -1px;
		bottom: -1px;
		position: absolute;
		padding: 1px 1px 1px 0;
	}

	.b {
		border-radius: 50%;
		background: transparent;
		position: absolute;
		box-shadow: 0 0 0 20vw white;
	}

	.c {
		position: absolute;
		bottom: 0;
		height: 0;
		width: 90%;
		box-shadow: rgba(0, 0, 0, 1) 0px 0px 20px 5px;
	}

	.data {
		display: inline-block;
	}
</style>
