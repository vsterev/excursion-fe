import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssGlobalData from '@csstools/postcss-global-data'
import postcssCustomMedia from 'postcss-custom-media'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'postcss',
    postcss: {
      plugins: [
        // Inject Reshaped @custom-media definitions into every CSS file
        // so postcss-custom-media can resolve them in component CSS modules
        postcssGlobalData({
          files: [
            path.resolve(__dirname, 'node_modules/reshaped/dist/themes/reshaped/media.css'),
          ],
        }),
        postcssCustomMedia(),
      ],
    },
  },
})
