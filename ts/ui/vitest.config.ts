import { defineConfig } from 'vitest/config'
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // isolate: false,
    // // you can also disable isolation only for specific pools
    // poolOptions: {
    //   forks: {
    //     isolate: false,
    //   },
    // },
    reporters: [
      // ['default', { summary: false }]
    ]
  },
})