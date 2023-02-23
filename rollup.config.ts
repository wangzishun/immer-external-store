import { defineConfig } from 'rollup'

import { babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

import pkg from './package.json' assert { type: 'json' }

const external = Object.keys(pkg.peerDependencies)

const extensions = ['.ts']

const config = defineConfig({
  input: 'src/index.ts',

  output: [
    { file: pkg.main, name: pkg.name, format: 'cjs' },
    // { file: pkg.module, format: 'esm' },
  ],
  external,
  plugins: [
    resolve({ extensions }),
    commonjs(),
    typescript(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      presets: ['@babel/preset-typescript', '@babel/preset-env'],
      extensions,
    }),
    // terser(),
  ],
})

const unpkg = defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: pkg.unpkg,
      name: 'ImmerExternalStore',
      format: 'umd',
      exports: 'named',
      globals: {
        react: 'React',
        immer: 'Immer',
      },
    },
  ],
  external,
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      presets: ['@babel/preset-typescript', '@babel/preset-env'],
      extensions,
    }),
    terser(),
  ],
})

export default [config, unpkg]
