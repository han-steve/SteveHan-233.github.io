<script lang="ts">
export interface Technology {
    name: string;
    svg: string;
    proficiency: 1.5 | 2 | 3 | 4 | 5;
    description: string;
    type: 'infra' | 'framework' | 'language';
    padding?: number; // 0-1, percentage of radius to use as padding
}
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';
import * as d3 from 'd3';
import { headerAnimationComplete } from '../stores';

    interface Props {
        technologies?: Technology[];
    }

    let { technologies = [] }: Props = $props();

// Scale factor for bubble sizes based on proficiency
const BUBBLE_SIZE_SCALE = 10;

interface Node extends Technology, d3.SimulationNodeDatum {
    id: number;
    r: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    fx: number | null;
    fy: number | null;
    isExpanded?: boolean;
    originalRadius?: number;
}

let svg: SVGElement | undefined = $state();
let container: HTMLDivElement | undefined = $state();
let width = $state(browser ? window.innerWidth : 1024); // Default width for SSR
let height = $derived(width < 768 ? 500 : 400);
let centerX = $derived(width * 0.5);
let centerY = $derived(height * 0.5);
let simulation: d3.Simulation<Node, undefined>;
let lastScrollY = 0;
let scrollVelocity = 0;
let scrollTimeout: number;
let currentForceY = 0;
let isVisible = false;
let hasAnimated = false;
let expandedNode: Node | null = null;
let isDragging = false;
let dragStartTime = 0;
let headerAnimationDone = $state(false);
const paddingX = 10;
const paddingY = 50;

// Subscribe to the header animation state
headerAnimationComplete.subscribe(value => {
    headerAnimationDone = value;
    if (headerAnimationDone && isVisible && !hasAnimated) {
        startAnimation();
        hasAnimated = true;
    }
});

// Handle scroll events with debouncing
function handleScroll() {
    if (!browser || !simulation || !isVisible) return;
    
    const currentScrollY = window.scrollY;
    scrollVelocity = (currentScrollY - lastScrollY) * 0.5;
    lastScrollY = currentScrollY;

    currentForceY = currentForceY * 0.8 - scrollVelocity;

    simulation.force('scroll', d3.forceY<Node>().strength(0.1).y(d => {
        return (d.y || 0) + currentForceY;
    }));

    simulation.alpha(0.5).restart();

    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = window.setTimeout(() => {
        const resetInterval = setInterval(() => {
            if (Math.abs(currentForceY) < 0.1) {
                currentForceY = 0;
                simulation.force('scroll', null);
                simulation.alpha(0.3).restart();
                clearInterval(resetInterval);
            } else {
                currentForceY *= 0.7;
                simulation.force('scroll', d3.forceY<Node>().strength(0.1).y(d => {
                    return (d.y || 0) + currentForceY;
                }));
                simulation.alpha(0.3).restart();
            }
        }, 50);
    }, 100);
}

function debouncedScroll() {
    if (!browser) return;
    requestAnimationFrame(handleScroll);
}

// Define cluster centers based on screen size
function getClusterCenters() {
    const isMobile = width < 768; // Standard mobile breakpoint
    const types = ['infra', 'framework', 'language'] as const;
    const maxContentWidth = 800; // Maximum content width
    
    if (isMobile) {
        // Triangle arrangement for mobile - very compact
        const verticalSpacing = height * 0.1; // Reduced from 0.15
        const horizontalSpacing = width * 0.1; // Reduced from 0.2
        
        return types.reduce((acc, type, i) => {
            switch(i) {
                case 0: // Top center
                    acc[type] = {
                        x: width / 2,
                        y: height * 0.43 // Moved down from 0.4
                    };
                    break;
                case 1: // Bottom left
                    acc[type] = {
                        x: width / 2 - horizontalSpacing,
                        y: height * 0.57 // Moved up from 0.6
                    };
                    break;
                case 2: // Bottom right
                    acc[type] = {
                        x: width / 2 + horizontalSpacing,
                        y: height * 0.57 // Moved up from 0.6
                    };
                    break;
            }
            return acc;
        }, {} as Record<typeof types[number], {x: number, y: number}>);
    } else {
        // Horizontal arrangement for desktop - spread out more
        const effectiveWidth = Math.min(width, maxContentWidth); // Use maxContentWidth as the limit
        const totalWidth = effectiveWidth * 0.5; // Use 50% of the width for more spread out layout
        const horizontalSpacing = totalWidth / (types.length - 1); // Space between clusters
        const startX = (width - totalWidth) / 2; // Center the cluster group in the viewport
        
        return types.reduce((acc, type, i) => {
            acc[type] = {
                x: startX + horizontalSpacing * i,
                y: height / 2
            };
            return acc;
        }, {} as Record<typeof types[number], {x: number, y: number}>);
    }
}

function initializeSimulation() {
    if (!browser || !container || nodes.length === 0) return;

    // Use viewport width for the simulation area
    width = window.innerWidth;
    centerX = width * 0.5;
    centerY = height * 0.5;

    // Get cluster centers based on current screen size
    const clusterCenters = getClusterCenters();

    // Initialize positions before creating nodes
    nodes.forEach(node => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height, 1000) * 3;
        const side = Math.floor(Math.random() * 4);
        
        switch(side) {
            case 0: // top
                node.x = Math.random() * width;
                node.y = -distance;
                break;
            case 1: // right
                node.x = width + distance;
                node.y = Math.random() * height;
                break;
            case 2: // bottom
                node.x = Math.random() * width;
                node.y = height + distance;
                break;
            case 3: // left
                node.x = -distance;
                node.y = Math.random() * height;
                break;
        }
        node.vx = 0;
        node.vy = 0;
    });

    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-70))
        .force('collide', d3.forceCollide<Node>(d => d.r + 2).strength(0.9))
        .force('x', d3.forceX<Node>(d => clusterCenters[d.type].x).strength(0.08))
        .force('y', d3.forceY<Node>(d => clusterCenters[d.type].y).strength(0.08))
        .force('bounds', () => {
            nodes.forEach(d => {
                if (d.x - d.r < paddingX) d.x = d.r + paddingX;
                if (d.x + d.r > width - paddingX) d.x = width - d.r - paddingX;
                if (d.y - d.r < paddingY) d.y = d.r + paddingY;
                if (d.y + d.r > height - paddingY) d.y = height - d.r - paddingY;
            });
        })
        .alphaDecay(0.02);

    simulation.stop();

    const svgElement = svg ? d3.select(svg) : null;
    if (!svgElement) return;
    
    svgElement.attr('viewBox', `0 0 ${width} ${height}`)
             .attr('preserveAspectRatio', 'xMidYMid meet');

    const node = svgElement.selectAll<SVGGElement, Node>('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .style('opacity', '0')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .call(d3.drag<SVGGElement, Node>()
            .on('start', (event, d) => {
                isDragging = false;
                dragStartTime = Date.now();
                if (!event.active) simulation.alphaTarget(0.2).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                isDragging = true;
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                // Always clear fixed position on drag end
                d.fx = null;
                d.fy = null;
                
                // Handle click if it wasn't a drag
                const dragEndTime = Date.now();
                const dragDuration = dragEndTime - dragStartTime;
                if (!isDragging || dragDuration < 200) {
                    handleNodeClick(event, d);
                }
            }));

    function handleNodeClick(event: any, d: Node) {
        // Ignore if we're in the middle of a drag
        if (isDragging) return;
        
        event.stopPropagation(); // Prevent bubbling
        
        // Reset previous expanded node
        if (expandedNode && expandedNode !== d) {
            expandedNode.isExpanded = false;
            expandedNode.r = expandedNode.originalRadius!;
        }

        // Toggle current node
        d.isExpanded = !d.isExpanded;
        d.r = d.isExpanded ? maxRadius : d.originalRadius!;
        expandedNode = d.isExpanded ? d : null;

        // Update simulation
        simulation.force('collide', d3.forceCollide<Node>(d => d.r + 2).strength(0.9));
        simulation.alpha(0.5).restart();

        // Update visuals with springy animation
        node.selectAll<SVGCircleElement, Node>('circle')
            .transition()
            .duration(800)
            .ease(d3.easeElastic.period(0.5))
            .attr('r', d => d.r);

        // Toggle visibility of elements with fade
        const icons = node.selectAll<SVGImageElement, Node>('.tech-icon');
        const texts = node.selectAll<SVGGElement, Node>('.tech-text');

        // Handle icon visibility
        icons
            .transition()
            .duration(300)
            .style('opacity', d => d.isExpanded ? 0 : 1)
            .on('end', function(d) {
                d3.select(this).style('display', d.isExpanded ? 'none' : 'block');
            });

        // Handle text visibility
        texts.each(function(this: SVGGElement, d: any) {
            const data = d as Node;
            const textGroup = d3.select(this);
            if (data.isExpanded) {
                textGroup
                    .style('display', 'block')
                    .style('opacity', 0)
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
            } else {
                textGroup
                    .transition()
                    .duration(300)
                    .style('opacity', 0)
                    .on('end', function() {
                        textGroup.style('display', 'none');
                    });
            }
        });
    }

    // Add black circle backgrounds
    node.append('circle')
        .attr('r', (d: Node) => d.r)
        .style('fill', '#1a1a1a')
        .style('stroke', 'none')
        .style('cursor', 'pointer')
        .on('click', function(this: SVGCircleElement, event: MouseEvent, d: any) {
            handleNodeClick(event, d as Node);
        });

    // Add technology icon
    node.append('svg:image')
        .attr('class', 'tech-icon')
        .attr('xlink:href', d => d.svg)
        .attr('x', d => {
            const padding = (d.padding ?? 0.3) * d.r; // Default padding is 30% of radius
            return -d.r + padding;
        })
        .attr('y', d => {
            const padding = (d.padding ?? 0.3) * d.r;
            return -d.r + padding;
        })
        .attr('width', d => {
            const padding = (d.padding ?? 0.3) * d.r * 2;
            return d.r * 2 - padding;
        })
        .attr('height', d => {
            const padding = (d.padding ?? 0.3) * d.r * 2;
            return d.r * 2 - padding;
        })
        .style('pointer-events', 'none');

    // Add text group (initially hidden)
    const textGroup = node.append('g')
        .attr('class', 'tech-text')
        .style('display', 'none')
        .style('pointer-events', 'none');

    // Add name text
    textGroup.append('text')
        .attr('class', 'name-text')
        .attr('dy', '-3em')
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(d => d.name);

    // Add description text with wrapping
    textGroup.append('text')
        .attr('class', 'desc-text')
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .each(function(d) {
            const text = d3.select(this);
            const words = d.description.split(' ');
            const lineHeight = 1.1;
            const maxWidth = maxRadius * 1.4;
            let currentLine: string[] = [];
            let lineNumber = 0;

            // Clear any existing content
            text.text('');
            text.selectAll('tspan').remove();

            // Function to test line width
            function getLineWidth(line: string) {
                const testTspan = text.append('tspan').text(line);
                const width = (testTspan.node() as SVGTextElement).getComputedTextLength();
                testTspan.remove();
                return width;
            }

            // Calculate lines
            const lines: string[] = [];
            let tempLine: string[] = [];
            words.forEach((word) => {
                tempLine.push(word);
                const currentText = tempLine.join(' ');
                const lineWidth = getLineWidth(currentText);

                if (lineWidth > maxWidth && tempLine.length > 1) {
                    lines.push(tempLine.slice(0, -1).join(' '));
                    tempLine = [word];
                }
            });
            if (tempLine.length > 0) {
                lines.push(tempLine.join(' '));
            }

            // Add lines starting from a fixed position near the top
            lines.forEach((line, i) => {
                text.append('tspan')
                    .attr('x', 0)
                    .attr('dy', i === 0 ? '-1em' : lineHeight + 'em')
                    .text(line);
            });
        });

    // Remove tooltip since we're showing info on click
    node.selectAll('title').remove();

    simulation.on('tick', () => {
        node.attr('transform', d => `translate(${d.x},${d.y})`);
        
        // Update icon positions
        node.selectAll<SVGImageElement, Node>('.tech-icon')
            .attr('x', d => {
                const padding = (d.padding ?? 0.3) * d.r;
                return -d.r + padding;
            })
            .attr('y', d => {
                const padding = (d.padding ?? 0.3) * d.r;
                return -d.r + padding;
            })
            .attr('width', d => {
                const padding = (d.padding ?? 0.3) * d.r * 2;
                return d.r * 2 - padding;
            })
            .attr('height', d => {
                const padding = (d.padding ?? 0.3) * d.r * 2;
                return d.r * 2 - padding;
            });
    });
}

// Export method to start animation
export function startAnimation() {
    if (!simulation || !svg) return;

    // Reset node positions and velocities
    nodes.forEach(node => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height, 1000) * 3; // 1000 is used for mobile devices to have a more dramatic effect
        const side = Math.floor(Math.random() * 4);
        
        switch(side) {
            case 0: // top
                node.x = Math.random() * width; // Spread horizontally
                node.y = -distance;
                break;
            case 1: // right
                node.x = width + distance;
                node.y = Math.random() * height; // Spread vertically
                break;
            case 2: // bottom
                node.x = Math.random() * width; // Spread horizontally
                node.y = height + distance;
                break;
            case 3: // left
                node.x = -distance;
                node.y = Math.random() * height; // Spread vertically
                break;
        }
        node.vx = 0;
        node.vy = 0;
    });

    // Update positions before starting animation
    d3.select(svg)
        .selectAll<SVGGElement, Node>('.node')
        .attr('transform', (d: Node) => `translate(${d.x},${d.y})`)
        .style('opacity', '0')
        .transition()
        .duration(800)
        .style('opacity', '1');

    isVisible = true;
    simulation.alpha(1).restart();
}

onMount(() => {
    if (!browser) return;
    initializeSimulation();
    window.addEventListener('scroll', debouncedScroll, { passive: true });

    // Add resize handler
    const handleResize = () => {
        width = window.innerWidth;
        centerX = width * 0.5;
        
        // Update SVG viewBox
        if (svg) {
            d3.select(svg)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        }

        // Update cluster centers and forces
        if (simulation) {
            const newClusterCenters = getClusterCenters();
            simulation
                .force('x', d3.forceX<Node>(d => newClusterCenters[d.type].x).strength(0.08))
                .force('y', d3.forceY<Node>(d => newClusterCenters[d.type].y).strength(0.08))
                .alpha(0.3)
                .restart();
        }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Set up intersection observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    isVisible = true;
                    if (headerAnimationDone && !hasAnimated) {
                        startAnimation();
                        hasAnimated = true;
                        observer.disconnect(); // Only trigger once
                    }
                }
            });
        },
        {
            root: null,
            threshold: 0,
            rootMargin: '-33% 0px' // Trigger when element reaches 1/3 of the viewport
        }
    );

    // Ensure container is mounted before observing
    setTimeout(() => {
        if (container) {
            observer.observe(container);
        }
    }, 0);

    return () => {
        observer.disconnect();
        window.removeEventListener('scroll', debouncedScroll);
        window.removeEventListener('resize', handleResize);
        if (scrollTimeout) clearTimeout(scrollTimeout);
        if (simulation) simulation.stop();
    };
});

onDestroy(() => {
    if (!browser) return;
    window.removeEventListener('scroll', debouncedScroll);
    if (scrollTimeout) clearTimeout(scrollTimeout);
    if (simulation) simulation.stop();
});
// Convert technologies to nodes with sized based on proficiency
let nodes = $derived(technologies.map((tech, index) => ({
    ...tech,
    id: index,
    r: tech.proficiency * BUBBLE_SIZE_SCALE,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    fx: null,
    fy: null,
    isExpanded: false,
    originalRadius: tech.proficiency * BUBBLE_SIZE_SCALE
})) as Node[]);
// Calculate the maximum radius for expanded state
let maxRadius = $derived(Math.max(...nodes.map(n => n.r)) * 2);
</script>

<div class="bubble-chart-container">
    <div class="bubble-chart-wrapper">
        <div class="bubble-chart" bind:this={container}>
            <svg 
                bind:this={svg}
                width="100%" 
                {height}
                style="background-color: transparent;"
            ></svg>
        </div>
    </div>
</div>

<style>
.bubble-chart-container {
    position: relative;
    margin: -50px -50vw;
    height: var(--chart-height, 400px);
    overflow: hidden;
    display: flex;
    align-items: center;
    left: 50%;
    width: 100vw;
    pointer-events: none;
}

@media (max-width: 768px) {
    .bubble-chart-container {
        --chart-height: 500px;
    }
}

.bubble-chart-wrapper {
    position: relative;
    width: 100%;
}

.bubble-chart {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

:global(.node) {
    cursor: pointer;
    pointer-events: all;
}

:global(.node circle) {
    transition: fill 0.2s;
}

:global(.node:hover circle) {
    fill: #2a2a2a;
}

:global(svg) {
    pointer-events: none;
}
</style> 