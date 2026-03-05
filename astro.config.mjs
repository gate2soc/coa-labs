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
					],
				},
			],
		}),
	],
});
