<script lang="ts">
	import { page } from '$app/stores';

	const routes = [
		{ name: 'projects', href: '/projects' },
		{ name: 'cv', href: '/cv' }
	];
</script>

<header class="flex justify-between mb-2">
    <!--<div class="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-md"></div>-->
	<div class="mt-5 mr-1 z-10 relative">
		<p class="mb-1 light">Hi, I'm</p>
		<h1 class="mb-1 text-4xl font-extrabold text-transparent bg-gradient-to-tr from-black from-20% to-70% to-neutral-700 dark:text-white bg-clip-text"><a href="/">Steve Han.</a></h1>
        <p class="text-base/5">
			<span class="light">I'm a</span> machine learning engineer<span class="light">,</span><br />
            full-stack developer<span class="light">, <br/>and</span> designer<span class="light">.</span>
		</p>
	</div>
	<nav class="flex">
		{#each routes as route (route.name)}
			<a
				href={route.href}
				class="route group relative block px-1 py-2 font-mono text-neutral-400 [letter-spacing:-.2em] [text-orientation:upright] [writing-mode:vertical-lr]"
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
	.route::before {
		content: '';
		display: block;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
        height: 9em;
        background: rgb(0,0,0);
        background: linear-gradient(45deg, rgba(0,0,0) 30%, rgba(64,64,64) 100%); /* black to neutral-700 */
		transform: translateY(-170px);
        transition: all .33s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
        transition: color .5s ease 0s, transform .25s ease .25s;
    }
	.text-hover {
		@apply group-hover:translate-y-3 group-hover:text-black delay-0;
	}
</style>
