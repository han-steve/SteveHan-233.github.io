<script lang="ts">
	import BubbleChart, { type Technology } from '$lib/components/BubbleChart.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	const technologies = [
		{
			name: 'Kubernetes',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 5 as const,
			description: 'Container orchestration platform'
		},
		{
			name: 'Svelte',
			svg: '/assets/icons/svelte.svg',
			proficiency: 1 as const,
			description: 'Frontend framework'
		},
		{
			name: 'AWS',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 4 as const,
			description: 'Cloud platform'
		},
		{
			name: 'React',
			svg: '/assets/icons/react.svg',
			proficiency: 4 as const,
			description: 'Frontend framework'
		},
		{
			name: 'JavaScript',
			svg: '/assets/icons/javascript.svg',
			proficiency: 4 as const,
			description: 'Typed JavaScript'
		},
		{
			name: 'Node.js',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 3 as const,
			description: 'JavaScript runtime'
		},
		{
			name: 'Python',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 3 as const,
			description: 'Programming language'
		},
		{
			name: 'GraphQL',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 3 as const,
			description: 'API query language'
		},
		{
			name: 'MongoDB',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 2 as const,
			description: 'NoSQL database'
		},
		{
			name: 'Redis',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 2 as const,
			description: 'In-memory database'
		},
		{
			name: 'Node.js',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 3 as const,
			description: 'JavaScript runtime'
		},
		{
			name: 'Python',
			svg: '/assets/icons/python.svg',
			proficiency: 3 as const,
			description: 'Programming language'
		},
		{
			name: 'GraphQL',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 3 as const,
			description: 'API query language'
		},
		{
			name: 'MongoDB',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 2 as const,
			description: 'NoSQL database'
		},
		{
			name: 'Go',
			svg: '/assets/icons/go.svg',
			proficiency: 2 as const,
			description: 'Programming language'
		}
	] satisfies Technology[];

	const projects = [
		{
			title: 'TRILL',
			description: 'Teaching humanoid robots from human demonstrations collected from VR headsets',
			imagePath: '/assets/projects/trill.png'
		},
		{
			title: 'VR Minecraft',
			description: 'A VR Minecraft game for Oculus Quest. Built with A-Frame and JS.',
			imagePath: '/assets/projects/voxcraft.png'
		},
		{
			title: 'Self-steering Scooter',
			description: 'A simulated scooter that learned to balance and steer itself with Reinforcement Learning.',
			imagePath: '/assets/projects/scooter.png'
		}
	];
</script>

<p>
	I'm currently building the Machine Learning Platform for the metaverse at <a
		class="link"
		href="https://corp.roblox.com"><em>Roblox</em></a
	>.
</p>

<p>
	Previously, I interned twice at <em>Amazon</em>, where I built serverless full-stack applications
	on AWS and became an
	<a
		class="link"
		href="https://www.credly.com/badges/a578df66-4f25-409d-98e4-d99f718d2b65?source=linked_in_profile"
		>AWS certified developer</a
	>. Before that, I was a founding engineer at a few startups, including one backed by
	<a class="link" href="https://www.ycombinator.com/companies/orca"><em>Y-Combinator</em></a>. I
	also attended many Hackathons (and won
	<a class="link" href="https://devpost.com/Steve_Han">a few of them</a>).
</p>

<!-- <p class="italic text-neutral-500 font-[Newsreader] text-lg"> -->
<p class="mb-0">
	I love learning new technologies and understanding how things work from first principles. My
	passion is to use computing to automate my life, build scalable systems, and create delightful
	interactions. To these ends, I've learned the following tools. The sizes are proportional to my
	proficiency.
</p>
<div>
	<BubbleChart {technologies} />
</div>

<p>
	I graduated from the <em>University of Texas at Austin</em> with a Masters and a Bachelors in Computer
	Science, a Bachelors in Math, and a certificate in Spanish. Some projects I worked on are:
</p>

{#each projects as project}
	<ProjectCard {...project} />
{/each}

<style>
	:global(body) {
		background-color: white;
	}
</style>
