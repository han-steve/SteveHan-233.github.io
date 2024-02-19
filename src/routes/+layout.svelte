<script lang="ts">
	import '../app.postcss';
	import Header from '$lib/components/Header.svelte';
    import {fly} from "svelte/transition";
	import type {LayoutData} from './$types';

    export let data: LayoutData;

    $: console.log("pathname", data);
</script>

<Header />


{#key data.pathname}
<main in:fly={{y : 10, duration: 250, delay: 250}} out:fly={{y: 10, duration: 250}}>
	<slot />
</main>
{/key}
