import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/message.js',
  output: {
    format: 'esm',
    file: 'lib/message.js',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    cleanup(),
  ]
}
