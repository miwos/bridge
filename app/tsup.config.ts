import { defineConfig } from 'tsup'

export default defineConfig({
  format: 'esm',
  target: 'esnext',
  noExternal: ['osc-js']
})