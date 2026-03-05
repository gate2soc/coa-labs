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
					label: 'Chapters',
					autogenerate: { directory: 'chapters' },
				},
			],
		}),
	],
});
