import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import * as Buffer from 'buffer';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact()
  ],
  define: {
    global: {},
    process: { browser: true },
    Buffer
  },
  resolve: {
    alias: {
      'src/': path.resolve(__dirname, 'src')
    }
  }
})
