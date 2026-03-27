import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssCustomMedia from 'postcss-custom-media'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    /* Disable Lightning CSS so PostCSS (with @custom-media support) is used instead */
    transformer: 'postcss',
    postcss: {
      plugins: [postcssCustomMedia()],
    },
  },
})
