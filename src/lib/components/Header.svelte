<script lang="ts">
	import { page } from '$app/stores';

	const routes = [
		{ name: 'projects', href: '/projects' },
		{ name: 'cv', href: '/cv' }
	];
</script>

<header class="flex justify-between mb-5">
	<div class="mt-5">
		<p class="mb-1 text-neutral-500">Hi, I'm</p>
		<h1 class="mb-1 text-4xl font-extrabold text-black"><a href="/">Steve Han.</a></h1>
        <p class="text-neutral-800 text-base/5">
			<span class="light">I'm a</span> machine learning engineer<span class="light">,</span><br />
            full-stack developer<span class="light">, <br/>and</span> designer<span class="light">.</span>
		</p>
	</div>
	<nav class="flex">
		{#each routes as route (route.name)}
			<a
				href={route.href}
				class="route group relative block px-1 py-2 font-mono text-neutral-500 [letter-spacing:-.2em] [text-orientation:upright] [writing-mode:vertical-lr]"
				class:selected={$page.url.pathname === route.href}
				><span
					class="text"
					class:text-hover={$page.url.pathname !== route.href}>{route.name.toUpperCase()}</span
				></a
			>
		{/each}
	</nav>
</header>

<style lang="postcss">
	.light {
		@apply text-neutral-500;
	}
	.route::before {
		content: '';
		display: block;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 0;
		background: black;
		transform: translateY(-170px);
        transition: all .35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-radius: 5px;
	}
    .route {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0); /* mobile safari no gray box */
    }
	.selected {
		@apply text-white;
	}
	.selected:before {
		transform: translateY(0);
	}
    .text {
        @apply relative block;
        transition: color .5s ease 0s, transform .2s ease .24s;
    }
	.text-hover {
		@apply group-hover:translate-y-3 group-hover:text-black delay-0;
	}
</style>
