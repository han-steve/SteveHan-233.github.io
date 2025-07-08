<script lang="ts">
	import { page } from '$app/stores';
	import { fade, blur, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { headerAnimationComplete } from '../stores';

	const routes = [
		{ name: 'projects', href: '/projects' },
		{ name: 'cv', href: '/cv' }
	];

	let animate = $state(true);
	let verticalCenter = $state(false);
	let enableTransition = $state(false);
	let lightenText = $state(false);

	const startAnimation = () => {
		verticalCenter = true;
		// toggle animation to false to true to trigger entrance transition
		setTimeout(() => {
			animate = false;
		}, 1);
		setTimeout(() => {
			animate = true;
		}, 2);
		document.body.style.overflow = 'hidden';
		setTimeout(() => {
			lightenText = true;
		}, 1500);
		setTimeout(() => {
			enableTransition = true;
		}, 2000);
		setTimeout(() => {
			verticalCenter = false;
			document.body.style.overflow = 'auto';
		}, 3000);
		setTimeout(() => {
			headerAnimationComplete.set(true);
		}, 3600);
	};

	// Bear with me - this is very hacky. It's meant to solve flash of ugliness.
	// Before hydration, the script on the bottom of this file runs and checks
	// if animation will run based on storage. If not, it sets the blur to 0 to show the full page.
	// If yes, it keeps the full screen blur to prevent flash of text, and it sets
	// skipAnimation to "AFTER_THIS".
	// After hydration, the previous backdrop is removed, and the code decides to run animation based
	// on the variable.
	const handleHydrationAnimation = () => {
		let backdrop = document.getElementById('backdrop');
		backdrop?.parentNode?.removeChild(backdrop);
		const skipAnimation = localStorage.getItem('skipAnimation');
		console.log(skipAnimation);
		if (skipAnimation == 'AFTER_THIS') {
			console.log('starting animation');
			localStorage.setItem('skipAnimation', 'TRUE');
			startAnimation();
		} else {
			// If we're not running the animation, immediately set header as complete
			headerAnimationComplete.set(true);
		}
	};

	function handleReplayAnimation() {
		console.log('restarting');
        localStorage.removeItem('skipAnimation');
        location.reload();
	};

	onMount(() => {
		handleHydrationAnimation();
	});
</script>

<header class="mb-2 flex justify-between lg:mt-20" data-sveltekit-preload-code="eager">
	{#if animate}
		<div
			class="relative z-10 mr-1 {enableTransition
				? 'transition-[top, translate] duration-1000'
				: ''} {verticalCenter ? 'top-[50svh] translate-y-[-50%] lg:top-[calc(50svh-5rem)]' : 'top-0 translate-y-[0%]'}"
		>
			<p class="mb-1 transition-colors duration-1000 {lightenText ? 'light' : 'text-neutral-700'}">
				<span in:fade={{ delay: 400 }}>Hi,</span> <span in:fade={{ delay: 900 }}>I'm</span>
			</p>
			<h1
				in:blur={{ delay: 1000, duration: 1200 }}
				class="mb-1 bg-gradient-to-tr from-black from-20% to-neutral-700 to-70% bg-clip-text text-4xl font-extrabold text-transparent dark:text-white"
			>
				<a href="/">Steve Han.</a>
			</h1>
			<p in:fly={{ y: 10, delay: 2000, easing: cubicOut, duration: 500 }} class="text-base/5">
				<span class="light">I'm a</span> machine learning engineer<span class="light">,</span><br />
				full-stack developer<span class="light">, <br />and</span> designer<span class="light"
					>.</span
				>
				<button onclick={handleReplayAnimation} aria-label="Replay entrance animation">
					<svg
						width="15px"
						height="15px"
						viewBox="0 0 48 48"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="inline"
						in:fade={{ delay: 3000, duration: 1000 }}
					>
						<path
							d="M21 24V18L26 21L31 24L26 27L21 30V24Z"
							fill="none"
							stroke="#bbb"
							stroke-width="4"
							stroke-linejoin="round"
						/>
						<path
							d="M11.2721 36.7279C14.5294 39.9853 19.0294 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C19.0294 6 14.5294 8.01472 11.2721 11.2721C9.6141 12.9301 6 17 6 17"
							stroke="#bbb"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M6 9V17H14"
							stroke="#bbb"
							stroke-width="4"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</p>
		</div>
	{/if}
	<nav class="z-1 flex">
		{#each routes as route (route.name)}
			<a
				href={route.href}
				class="route group relative block px-1 py-2 font-mono text-neutral-400 [letter-spacing:-.2em] [text-orientation:upright] [writing-mode:vertical-lr]"
				class:selected={$page.url.pathname === route.href}
				><span class="text" class:text-hover={$page.url.pathname !== route.href}
					>{route.name.toUpperCase()}</span
				></a
			>
		{/each}
	</nav>
	{#if verticalCenter}
		<div
			out:blur={{ duration: 500, delay: 500 }}
			class="absolute bottom-0 left-0 right-0 top-0 backdrop-blur-2xl"
		></div>
	{/if}
	<div class="absolute bottom-0 left-0 right-0 top-0 z-20 backdrop-blur-2xl" id="backdrop"></div>
	<script>
		// Putting script here to be included in the prerendered page - before hydration.
		// This way, the code runs immediately as the content is shown.
		// Blur out the page before hydration if loading for the first time.
		console.log(localStorage);
		if ('skipAnimation' in localStorage) {
			let backdrop = document.getElementById('backdrop');
			backdrop.style.opacity = 0;
		} else {
			localStorage.setItem('skipAnimation', 'AFTER_THIS');
		}
	</script>
</header>

<style lang="postcss">
	.route::before {
		content: '';
		display: block;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 9em;
		background: rgb(0, 0, 0);
		background: linear-gradient(
			45deg,
			rgba(0, 0, 0) 30%,
			rgba(64, 64, 64) 100%
		); /* black to neutral-700 */
		transform: translateY(-170px);
		transition: all 0.33s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		border-radius: 5px;
		opacity: 0;
	}
	.route {
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0); /* mobile safari no gray box */
		opacity: 1;
	}
	.selected {
		@apply text-white;
		opacity: 1;
	}
	.selected:before {
		transform: translateY(0);
		opacity: 1;
	}
	.text {
		@apply relative block;
		transition: color 0.5s ease 0s, transform 0.25s ease 0.25s;
	}
	.text-hover {
		@apply delay-0 group-hover:translate-y-3 group-hover:text-black;
	}
</style>
