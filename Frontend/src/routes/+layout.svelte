<script>
	import { fly, fade } from 'svelte/transition';
	import Cheese from '$lib/components/Cheese.svelte';
	import '../app.postcss';
	import './styles.css';
	let showJarvis = false;
	let showOpenButton = false;
</script>

<div class="app bg-[url('$lib/images/Remy.jpg')]">
	<main>
		{#if showJarvis == true}
			<slot />
		{:else}
			<div class="relative flex items-center justify-center flex-1">
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<div
					transition:fade
					on:mouseover={() => {
						showOpenButton = true;
					}}
					class="border-2 border-gray-300 rounded-full hover:shadow-2xl hover:shadow-red-700 relative"
				>
					<div class="boop">
						<Cheese />
					</div>
					{#if showOpenButton}
						<button
							transition:fly={{ x: 200, duration: 1000 }}
							class="absolute top-0 right-0 mt-16 -mr-52 bg-gray-300 text-gray-900 hover:text-white/90 font-bold shadow-md border border-yellow-300/50 hover:bg-yellow-400 shadow-yellow-300 px-4 py-1 rounded-xl"
							type="button"
							on:click={() => {
								showJarvis = true;
							}}>Consult with Remy</button
						>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		overflow-x: hidden; /* Prevent horizontal overflow */
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1275px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	@keyframes boop {
		0% {
			transform: rotate(0deg);
		}
		20% {
			transform: rotate(-15deg);
		}
		40% {
			transform: rotate(15deg);
		}
		60% {
			transform: rotate(-7deg);
		}
		80% {
			transform: rotate(7deg);
		}
		90% {
			transform: rotate(-3deg);
		}
		95% {
			transform: rotate(2deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	.boop:hover {
		display: inline-block;
		animation: 1s boop forwards running;
	}
</style>
