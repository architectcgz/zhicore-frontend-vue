import type { App, Plugin } from 'vue';

export const ICON_SIZES = {
  nav: 24,
  card: 16,
  button: 20,
} as const;

export const IconsPlugin: Plugin = {
  install(_app: App) {},
};
