// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	server: { host: true },
	integrations: [
		starlight({
			title: 'Computer Organization & Architecture Lab Manual',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/REPLACE_ME/coa-online' }],
			sidebar: [
				{
					label: 'Part 1',
					items: [
						{
							label: 'Chapter 1 — Getting Started',
							items: [
								{ label: 'Overview', link: '/chapters/chapter-1/' },
								{ label: 'Installing and Using Logisim Evolution', link: '/chapters/chapter-1/#installing-and-using-logisim-evolution' },
								{ label: 'Building Your First Circuit (Logisim)', link: '/chapters/chapter-1/#building-your-first-circuit-in-logisim-evolution' },
								{ label: 'Installing and Using Ripes', link: '/chapters/chapter-1/#installing-and-using-ripes' },
								{ label: 'Running Your First Program (Ripes)', link: '/chapters/chapter-1/#running-your-first-program-in-ripes' },
							],
						},
					],
				},
			],
		}),
	],
});
