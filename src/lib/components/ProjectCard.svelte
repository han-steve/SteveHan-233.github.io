<script lang="ts">
  export let title: string;
  export let description: string;
  export let imagePath: string;
</script>

<div class="flex items-start gap-4 mb-8">
  <div class="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
    <img src={imagePath} alt={title} class="w-full h-full object-cover" />
  </div>
  <div>
    <h2 class="text-2xl font-bold mb-2">{title}</h2>
    <p class="text-gray-700">{description}</p>
  </div>
</div>

<style>
  /* Add any component-specific styles here */
</style> 