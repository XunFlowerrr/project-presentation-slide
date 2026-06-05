import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file export config — inlines ALL assets (images, videos) as base64
// WARNING: output will be large (~220MB+ due to video assets)
export default defineConfig({
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    exclude: ['@react-three/rapier', '@dimforge/rapier3d-compat'],
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    viteSingleFile(),
  ],
  build: {
    outDir: 'dist-single',
    // Inline every asset below 200 MB (covers all mp4/image files)
    assetsInlineLimit: 200 * 1024 * 1024,
    // Required for singlefile to work properly
    cssCodeSplit: false,
    target: 'esnext',
    rollupOptions: {
      output: {
        // Single JS chunk so vite-plugin-singlefile can embed it
        inlineDynamicImports: true,
      },
    },
  },
})
