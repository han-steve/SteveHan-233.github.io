<script lang="ts">
	import { page } from '$app/stores';

	const routes = [
		{ name: 'projects', href: '/projects' },
		{ name: 'cv', href: '/cv' }
	];
</script>

<header class="flex justify-between p-5 pt-10">
	<div>
		<p class="mb-1 text-neutral-500">Hi, I'm</p>
		<h1 class="mb-1 text-4xl font-extrabold text-black">Steve Han.</h1>
		<p class="text-neutral-800">
			<span class="light">I'm a</span> software engineer<span class="light">,</span><br />
			designer<span class="light">, and</span> researcher<span class="light">.</span>
		</p>
	</div>
	<nav class="flex">
		{#each routes as route (route.name)}
			<a
				href={route.href}
				class="font-mono text-neutral-500 transition-colors [letter-spacing:-.2em] [writing-mode:vertical-lr] [text-orientation:upright] hover:text-white hover:bg-black "
				class:text-black={$page.url.pathname === route.href}>{route.name.toUpperCase()}</a
			>
		{/each}
	</nav>
</header>

<style lang="postcss">
	.light {
		@apply text-neutral-500;
	}
</style>
