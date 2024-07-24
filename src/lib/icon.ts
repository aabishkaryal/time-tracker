import { type IconProps } from 'lucide-svelte';
import {
  Album,
  Anvil,
  Apple,
  AppWindow,
  Armchair,
  Book,
  Briefcase,
  Library,
  Star
} from 'lucide-svelte/icons';
import type { ComponentConstructorOptions, SvelteComponent } from 'svelte';

const iconMap: Record<
	string,
	new (options: ComponentConstructorOptions<IconProps>) => SvelteComponent<IconProps>
> = {
	briefcase: Briefcase,
	apple: Apple,
	anvil: Anvil,
	'app-window': AppWindow,
	armchair: Armchair,
	album: Album,
	book: Book,
	library: Library,
	star: Star
};

export default iconMap;
