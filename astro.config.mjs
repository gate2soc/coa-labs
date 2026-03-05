// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
	server: { host: true },
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
	},
	integrations: [
		starlight({
			title: 'Computer Organization & Architecture Lab Manual',
			customCss: ['katex/dist/katex.min.css', '/src/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/REPLACE_ME/coa-online' }],
			sidebar: [
				{
					label: 'Part 1 - Digital Logic',
					items: [
						{
							label: 'Chapter 1 — Getting Started',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-1/' },
								{ label: 'Installing and Using Logisim Evolution', link: '/chapters/chapter-1/logisim-installation/' },
								{ label: 'Building Your First Circuit (Logisim)', link: '/chapters/chapter-1/logisim-first-circuit/' },
								{ label: 'Installing and Using Ripes', link: '/chapters/chapter-1/ripes-installation/' },
								{ label: 'Running Your First Program (Ripes)', link: '/chapters/chapter-1/ripes-first-program/' },
								{ label: 'Summary', link: '/chapters/chapter-1/summary/' },
							],
						},
						{
							label: 'Chapter 2 — Combinational Logic Design',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-2/' },
								{ label: 'Multiplexers and Decoders', link: '/chapters/chapter-2/mux-decoder/' },
								{ label: 'Adders', link: '/chapters/chapter-2/adders/' },
								{ label: 'Arithmetic Logic Unit (ALU)', link: '/chapters/chapter-2/alu/' },
								{ label: 'Summary', link: '/chapters/chapter-2/summary/' },
							],
						},
						{
							label: 'Chapter 3 — Sequential Logic Design',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-3/' },
								{ label: 'Latches and Flip-Flops', link: '/chapters/chapter-3/latches-flip-flops/' },
								{ label: 'Register File', link: '/chapters/chapter-3/register-file/' },
								{ label: 'Finite State Machines (FSM)', link: '/chapters/chapter-3/fsm/' },
								{ label: 'Summary', link: '/chapters/chapter-3/summary/' },
							],
						},
					],
				},
				{
					label: 'Part 2 - Processor Architecture',
					items: [
						{
							label: 'Chapter 4 — Generating Assembly Programs',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-4/' },
								{ label: 'Toolchain: C to Bare-Metal Assembly', link: '/chapters/chapter-4/toolchain/' },
								{ label: 'Common Assembly Structure', link: '/chapters/chapter-4/program-structure/' },
								{ label: 'Summary', link: '/chapters/chapter-4/summary/' },
							],
						},
						{
							label: 'Chapter 5 — Single-Cycle CPU: Design & Implementation',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-5/' },
								{ label: 'Datapath Construction', link: '/chapters/chapter-5/datapath/' },
								{ label: 'Control Unit Design', link: '/chapters/chapter-5/control-unit/' },
								{ label: 'System Integration & Testing', link: '/chapters/chapter-5/cpu-integration/' },
								{ label: 'Summary', link: '/chapters/chapter-5/summary/' },
							],
						},
						{
							label: 'Chapter 6 — Pipeline Analysis (Ripes)',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-6/' },
								{ label: 'Ripes Processor View', link: '/chapters/chapter-6/ripes-view/' },
								{ label: 'Five-Stage Pipeline', link: '/chapters/chapter-6/five-stage-pipeline/' },
								{ label: 'Pipeline Hazards', link: '/chapters/chapter-6/hazards/' },
								{ label: 'Summary', link: '/chapters/chapter-6/summary/' },
							],
						},
					],
				},
				{
					label: 'Part 3 - Memory Systems',
					items: [
						{
							label: 'Chapter 7 — Memory Expansion & Error Checking',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-7/' },
								{ label: 'Bit-Width Expansion (Parallel Chips)', link: '/chapters/chapter-7/bit-width-expansion/' },
								{ label: 'Capacity Expansion (Address Mapping & CS)', link: '/chapters/chapter-7/address-mapping-chip-select/' },
								{ label: 'Hamming Code (ECC)', link: '/chapters/chapter-7/hamming-code/' },
								{ label: 'Summary', link: '/chapters/chapter-7/summary/' },
							],
						},
						{
							label: 'Chapter 8 — Cache',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-8/' },
								{ label: 'Mapping Strategies (Basics)', link: '/chapters/chapter-8/mapping-basics/' },
								{ label: 'Ripes Cache View & Config', link: '/chapters/chapter-8/ripes-cache-view/' },
								{ label: 'Replacement Policy', link: '/chapters/chapter-8/replacement-policy/' },
								{ label: 'Write Policy', link: '/chapters/chapter-8/write-policy/' },
								{ label: 'Summary', link: '/chapters/chapter-8/summary/' },
							],
						},
					],
				},
				{
					label: 'Part 4 - I/O Systems',
					items: [
						{
							label: 'Chapter 9 — I/O Interfaces',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-9/' },
								{ label: 'Memory-Mapped I/O (MMIO)', link: '/chapters/chapter-9/mmio/' },
								{ label: 'Polling I/O', link: '/chapters/chapter-9/polling/' },
								{ label: 'Interrupt-Driven I/O', link: '/chapters/chapter-9/interrupts/' },
								{ label: 'DMA', link: '/chapters/chapter-9/dma/' },
								{ label: 'Summary', link: '/chapters/chapter-9/summary/' },
							],
						},
					],
				},
			],
		}),
	],
});
