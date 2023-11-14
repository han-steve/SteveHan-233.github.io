<script lang="ts">

	import '../app.postcss';
	import Header from '$lib/components/Header.svelte';
    import {fly} from "svelte/transition";
</script>

<Header />

<main transition:fly={{y : 10, duration: 350}}>
	<slot />
</main>
