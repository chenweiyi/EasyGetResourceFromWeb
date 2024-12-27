import {
  defineConfig,
  presetAttributify,
  presetUno,
  presetIcons,
} from 'unocss';

export default defineConfig({
  // ...UnoCSS options
  presets: [presetUno(), presetAttributify(), presetIcons()],
});
