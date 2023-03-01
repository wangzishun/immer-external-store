import { defineConfig } from 'rollup'

import { babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { DEFAULT_EXTENSIONS } from '@babel/core'

import pkg from './package.json' assert { type: 'json' }

const external = Object.keys(pkg.dependencies)

const extensions = ['.ts']

const config = defineConfig({
  input: 'src/index.ts',

  output: [
    { file: pkg.main, name: pkg.name, format: 'cjs' },
    { file: pkg.module, format: 'esm' },
  ],
  external,
  plugins: [
    resolve({ extensions }),
    commonjs(),
    typescript({ emitDeclarationOnly: true }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        '@babel/preset-typescript',
        ['@babel/preset-env', { exclude: ['@babel/plugin-transform-typeof-symbol'] }],
      ],
      extensions,
    }),
    // terser()
  ],
})

export default config
