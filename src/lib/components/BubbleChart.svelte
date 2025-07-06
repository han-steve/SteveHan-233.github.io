<script lang="ts">
export interface Technology {
    name: string;
    svg: string;
    proficiency: 1 | 2 | 3 | 4 | 5;
    description: string;
}
import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';
import * as d3 from 'd3';

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

let svg: SVGElement = $state();
let container: HTMLDivElement = $state();
let width: number;
let height = 350;
let centerX: number;
let centerY: number;
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

function initializeSimulation() {
    if (!browser || !container || nodes.length === 0) return;

    width = container.clientWidth;
    centerX = width * 0.5;
    centerY = height * 0.5;

    // Initialize positions before creating nodes
    nodes.forEach(node => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) * 1.5;
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

    const padding = 3;

    simulation = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-70)) // Reduced repulsion
        .force('collide', d3.forceCollide<Node>(d => d.r + 2).strength(0.9)) // Reduced padding, increased strength
        .force('x', d3.forceX(centerX).strength(0.07)) // Slightly increased center pull
        .force('y', d3.forceY(centerY).strength(0.07)) // Slightly increased center pull
        .force('bounds', () => {
            nodes.forEach(d => {
                if (d.x - d.r < padding) d.x = d.r + padding;
                if (d.x + d.r > width - padding) d.x = width - d.r - padding;
                if (d.y - d.r < padding) d.y = d.r + padding;
                if (d.y + d.r > height - padding) d.y = height - d.r - padding;
            });
        })
        .alphaDecay(0.02); // Keep the same decay for smooth animation

    simulation.stop();

    const svgElement = d3.select(svg);
    
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
        .attr('x', d => -d.r * 0.7)
        .attr('y', d => -d.r * 0.7)
        .attr('width', d => d.r * 1.4)
        .attr('height', d => d.r * 1.4)
        .style('pointer-events', 'none');

    // Add text group (initially hidden)
    const textGroup = node.append('g')
        .attr('class', 'tech-text')
        .style('display', 'none')
        .style('pointer-events', 'none');

    // Add name text
    textGroup.append('text')
        .attr('class', 'name-text')
        .attr('dy', '-1.5em')
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(d => d.name);

    // Add description text with wrapping
    textGroup.append('text')
        .attr('class', 'desc-text')
        .attr('dy', '0.5em')
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .each(function(d) {
            const text = d3.select(this);
            const words = d.description.split(' ');
            const lineHeight = 1.2;
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

            // Process each word
            words.forEach((word, i) => {
                currentLine.push(word);
                const currentText = currentLine.join(' ');
                const lineWidth = getLineWidth(currentText);

                // If adding this word makes the line too wide
                if (lineWidth > maxWidth && currentLine.length > 1) {
                    // Add the line without the current word
                    const previousLine = currentLine.slice(0, -1).join(' ');
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', lineNumber === 0 ? 0 : `${lineHeight}em`)
                        .text(previousLine);

                    // Start new line with current word
                    currentLine = [word];
                    lineNumber++;
                }

                // If this is the last word, add whatever is left
                if (i === words.length - 1) {
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', lineNumber === 0 ? 0 : `${lineHeight}em`)
                        .text(currentLine.join(' '));
                }
            });
        });

    // Remove tooltip since we're showing info on click
    node.selectAll('title').remove();

    simulation.on('tick', () => {
        node.attr('transform', d => `translate(${d.x},${d.y})`);
        
        // Update icon and text positions
        node.selectAll<SVGImageElement, Node>('.tech-icon')
            .attr('x', d => -d.r * 0.7)
            .attr('y', d => -d.r * 0.7)
            .attr('width', d => d.r * 1.4)
            .attr('height', d => d.r * 1.4);
    });
}

// Export method to start animation
export function startAnimation() {
    if (!simulation || !svg) return;

    // Reset node positions and velocities
    nodes.forEach(node => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(width, height) * 1.5;
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

    // Set up intersection observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    startAnimation();
                    hasAnimated = true;
                    observer.disconnect(); // Only trigger once
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
let maxRadius = $derived(Math.max(...nodes.map(n => n.r)) * 1.5);
</script>

<div class="bubble-chart" bind:this={container}>
    <svg 
        bind:this={svg}
        width="100%" 
        {height}
        style="background-color: white;"
    ></svg>
</div>

<style>
.bubble-chart {
    width: 100%;
    height: 100%;
}

:global(.node) {
    cursor: pointer;
}

:global(.node circle) {
    transition: fill 0.2s;
}

:global(.node:hover circle) {
    fill: #2a2a2a;
}
</style> 