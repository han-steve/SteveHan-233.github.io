<script lang="ts">
	import BubbleChart, { type Technology } from '$lib/components/BubbleChart.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	const technologies: Technology[] = [
		{
			name: 'Kubernetes',
			svg: '/assets/icons/kubernets.svg',
			proficiency: 5 as const,
			description:
				'2 YoE creating and operating (and very, very occasionally breaking) production clusters with 3000+ nodes',
			type: 'infra'
		},
		{
			name: 'Istio',
			svg: '/assets/icons/istio.svg',
			proficiency: 2 as const,
			description: 'Developed service mesh with mTLS, authorization policies, and load balancing',
			type: 'infra'
		},
		{
			name: 'AWS',
			svg: '/assets/icons/aws.svg',
			proficiency: 5 as const,
			description:
				'Certified developer, 3 YoE with DynamoDB, S3, EKS, ELB, Lambda, CloudFormation and more',
			type: 'infra',
			padding: 0.4
		},
		{
			name: 'Prometheus',
			svg: '/assets/icons/prometheus.svg',
			proficiency: 2 as const,
			description:
				'Implemented observability solutions with Prometheus Operator, Grafana dashboards, and Grafana Alloy',
			type: 'infra'
		},
		{
			name: 'ArgoCD',
			svg: '/assets/icons/argocd.svg',
			proficiency: 2 as const,
			description:
				'Developed production-ready clusters using ArgoCD GitOps, Helm, Kustomize, and Kargo multistage promotion',
			type: 'infra'
		},
		{
			name: 'Kubeflow',
			svg: '/assets/icons/kubeflow.svg',
			proficiency: 4 as const,
			description: 'Operated the Kubeflow ML platform (Notebooks, Pipelines, Serving) used by hundreds of internal MLEs',
			type: 'infra'
		},
		{
			name: 'Docker',
			svg: '/assets/icons/docker.svg',
			proficiency: 3 as const,
			description: 'Created optimized Docker images for ML use cases and remote development',
			type: 'infra'
		},
		{
			name: 'Vim',
			svg: '/assets/icons/vim.svg',
			proficiency: 1.5 as const,
			description: "I'm a terminal warrior whose favorite weapons are neovim, tmux, k9s, and zsh",
			type: 'infra'
		},
		{
			name: 'Svelte',
			svg: '/assets/icons/svelte.svg',
			proficiency: 2 as const,
			description: 'You are looking at Svelte 5 and SvelteKit code right now!',
			type: 'framework'
		},
		{
			name: 'Vue',
			svg: '/assets/icons/vue.svg',
			proficiency: 2 as const,
			description:
				'Vue was my first web framework, and in my Vue it still has the best developer experience',
			type: 'framework'
		},
		{
			name: 'React',
			svg: '/assets/icons/react.svg',
			proficiency: 5 as const,
			description:
				'Developed production React applications for startups and big companies with React, Redux, and Material UI',
			type: 'framework'
		},
		{
			name: 'Nextjs',
			svg: '/assets/icons/nextjs.svg',
			proficiency: 1.5 as const,
			description: 'Adopted latest frontend tooling such as Next.js and TurboPack',
			type: 'framework'
		},
		{
			name: 'Expo',
			svg: '/assets/icons/expo.svg',
			proficiency: 3 as const,
			description: 'Developed cross-platform mobile apps using Expo and React Native',
			type: 'framework',
			padding: 0.4
		},
		{
			name: 'PyTorch',
			svg: '/assets/icons/pytorch.svg',
			proficiency: 3 as const,
			description:
				'Conducted ML research, distributed training, and inference optimization with PyTorch',
			type: 'framework',
			padding: 0.4
		},
		{
			name: 'Ray',
			svg: '/assets/icons/ray.svg',
			proficiency: 5 as const,
			description:
				'Built the Ray infrastructure at my company and drove its widespread adoption for training foundation models',
			type: 'framework',
			padding: 0.4
		},
		{
			name: 'JavaScript',
			svg: '/assets/icons/javascript.svg',
			proficiency: 4 as const,
			description:
				'TypeScript is preferred. Despite loving the "You Don\'t Know JS" books, I do know something about JavaScript',
			type: 'language',
			padding: 0.5
		},
		{
			name: 'HTML&CSS',
			svg: '/assets/icons/htmlcss.svg',
			proficiency: 3 as const,
			description:
				'Can write sematic HTML and responsive CSS without AI. By the way are they programming languages?',
			type: 'language'
		},
		{
			name: 'C++',
			svg: '/assets/icons/c++.svg',
			proficiency: 2 as const,
			description: 'Language of choice for computer graphics and robotics research infrastructure',
			type: 'language'
		},
		{
			name: 'Python',
			svg: '/assets/icons/python.svg',
			proficiency: 3 as const,
			description: "If you give me a LeetCode question, I'm doing it in Python",
			type: 'language'
		},
		{
			name: 'Java',
			svg: '/assets/icons/java.svg',
			proficiency: 2 as const,
			description: 'Will use it if I have to (talking about you, Amazon)',
			type: 'language'
		},
		{
			name: 'Go',
			svg: '/assets/icons/go.svg',
			proficiency: 5 as const,
			description:
				'Wrote backends, Kubernetes controllers, and just about everything else in Go because I love it so much',
			type: 'language'
		},
		{
			name: 'Rust',
			svg: '/assets/icons/rust.svg',
			proficiency: 1.5 as const,
			description: 'Succumbed to peer pressure and read the Rust book',
			type: 'language'
		}
	];

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
			description:
				'A simulated scooter that learned to balance and steer itself with Reinforcement Learning.',
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
	passion is to use computing to build scalable automations, create delightful interactions, and
	enhance our well-being. To these ends, I've learned the following tools. The sizes are
	proportional to my proficiency. You can poke at them to learn more.
</p>
<div>
	<BubbleChart {technologies} />
</div>

<p>
	I graduated from the <em>University of Texas at Austin</em> with a Masters and a Bachelors in Computer
	Science, a Bachelors in Math, and a certificate in Spanish.
</p>

<!-- 
{#each projects as project}
	<ProjectCard {...project} />
{/each} -->

<style>
	:global(body) {
		background-color: white;
	}
</style>
