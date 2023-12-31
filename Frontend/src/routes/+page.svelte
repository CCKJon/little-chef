<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import type { ChatCompletionRequestMessage } from 'openai';
	import { SSE } from 'sse.js';
	import { fade } from 'svelte/transition';
	import TimeAndDateDisplay from '$lib/components/TimeAndDateDisplay.svelte';
	import Cheese from '$lib/components/Cheese.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import VoiceRecognition from '$lib/components/VoiceRecognition.svelte';
	import Front_Cover from '$lib/images/Front_Cover.png';

	let query: string = '';
	let answer: string = '';
	let loading: boolean = false;
	let chatMessages: ChatCompletionRequestMessage[] = [];
	let scrollToDiv: HTMLDivElement;
	let weatherData: any = null; // Modify the type accordingly
	let userLocation: any = null; // Modify the type accordingly

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
		}, 100);
	}

	const handleSubmit = async (e?: { detail: any }) => {
		console.log(e?.detail);

		let transcript;

		if (e) {
			transcript = e.detail;
			query = transcript;
		}

		loading = true;
		chatMessages = [...chatMessages, { role: 'user', content: query }];

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		});

		query = '';
		eventSource.addEventListener('error', handleError);
		eventSource.addEventListener('message', async (e) => {
			scrollToBottom();
			try {
				loading = false;
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }];

					if (weatherData && userLocation) {
						const weatherMessage = `These are all user details, please don't say anything like Based on the information you provided, I want you to just provide the answer without saying I provided you any data concerning the weather and my location. I want it to be a mystery as to how you know this information. Location: ${JSON.stringify(
							userLocation
						)}, Weather: ${JSON.stringify(weatherData)}`;
						chatMessages = [...chatMessages, { role: 'system', content: weatherMessage }];
					}
					answer = '';
					return;
				}

				const completionResponse = JSON.parse(e.data);
				const [{ delta }] = completionResponse.choices;
				if (delta.content) {
					answer = (answer ?? '') + delta.content;
				}
			} catch (err) {
				handleError(err);
			}
		});

		eventSource.stream();
		scrollToBottom();
	};

	function handleError<T>(err: T) {
		loading = false;
		query = '';
		answer = '';
		console.error(err);
	}

	// Listen for emitted events from Weather component
	const handleWeatherData = (event: { detail: any }) => {
		weatherData = event.detail;
	};

	const handleUserLocation = (event: { detail: any }) => {
		userLocation = event.detail;
	};
</script>

<svelte:head>
	<title>Welcome to Gusteau’s</title>
	<meta name="description" content="Go look at me! my github is /leenpham" />
</svelte:head>

<div class="relative flex flex-col w-full px-8 items-center z-0">
	<div class="relative flex flex-row w-full justify-between items-center py-32">
		<div class="flex flex-col gap-2">
			<TimeAndDateDisplay />
			<Weather on:weatherData={handleWeatherData} on:userLocation={handleUserLocation} />
		</div>
		<div class="flex flex-row absolute -z-10 w-full justify-center">
			<img
				transition:fade
				class="w-[380px] h-auto object-cover mix-blend-multiply"
				src={Front_Cover}
				alt="avatar"
			/>
		</div>
		<div class="boop">
			<Cheese />
		</div>
	</div>
	<div
		class="absolute bg-black sm:bg-black/80 lg:bg-transparent h-full flex flex-col max-w-[739px]"
	>
		<h1
			class="text-3xl font-bold w-full text-center text-orange-400 px-2 py-1 border-orange-200 border rounded-t-3xl shadow-orange-400 shadow-xl"
		>
			Welcome to Gusteau’s, bon apetit
			<div class="w-full text-orange-400 tracking-widest text-center text-xl">
				Starring: Little chef
			</div>
		</h1>
		<div
			class="flex-auto w-full bg-gray-900/50 border shadow-lg border-orange-200 shadow-orange-400 p-4 overflow-y-auto flex flex-col gap-4"
		>
			<div class="flex flex-col gap-2">
				<ChatMessage type="assistant" message="Hello, how may I assist you today?" />
				{#each chatMessages as message}
					{#if !message.content?.startsWith('These are all user details,')}
						<ChatMessage type={message.role} message={message.content} />
					{/if}
				{/each}
				{#if loading}
					<ChatMessage type="assistant" message="Loading.." />
				{/if}
			</div>
			<div class="" bind:this={scrollToDiv} />
		</div>
		<form
			class="flex flex-col w-full rounded-b-3xl gap-4 bg-gray-900/50 p-4 shadow-lg shadow-orange-400 border-orange-200 border-t-0 border"
			on:submit|preventDefault={() => handleSubmit()}
		>
			<div class="flex flex-row gap-5 w-full">
				<input
					type="text"
					class="w-full rounded-full bg-gray-600 text-orange-400 focus:ring-0 focus:border-0 border-0"
					bind:value={query}
				/>
				<button
					type="submit"
					class="text-orange-400 shadow-md border border-orange-400/50 hover:bg-gray-600/10 shadow-orange-400 px-4 py-1 rounded-xl"
				>
					Send
				</button>
			</div>
		</form>

		<VoiceRecognition on:transcript={handleSubmit} />
	</div>
</div>

<style>
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
