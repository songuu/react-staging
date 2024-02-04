import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'
import ts from 'rollup-plugin-typescript2'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  input: 'src/index.ts',
  output: [{ file: 'dist/index.js', format: 'es' }],
  external: ['path', 'fs-extra', '@clack/prompts', 'kleur/colors', 'minimist'],
  plugins: [
    terser(),
    ts({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }),
    copy({ targets: [{ src: 'src/templates', dest: 'dist' }] }),
  ],
}
