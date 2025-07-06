<script lang="ts">
	import { run } from 'svelte/legacy';

	import '../app.postcss';
	import Header from '$lib/components/Header.svelte';
    import {fly} from "svelte/transition";
	import type {LayoutData} from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

    run(() => {
		console.log("pathname", data);
	});
</script>

<Header />

{#key data.pathname}
<main in:fly={{y : 10, duration: 250, delay: 250}} out:fly={{y: 10, duration: 250}}>
	{@render children?.()}
</main>
{/key}
