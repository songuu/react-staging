import * as fs from 'node:fs'
import * as path from 'node:path'

import type { Linter } from 'eslint'

// @ts-ignore
import createESLintConfig from '@songyulala/create-eslint-config'

import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'

export default function renderEslint(projectRoot: string, {
  needsTypeScript,
  needsPrettier
}: {
  needsTypeScript: boolean
  needsPrettier: boolean
}) {
  const additionalConfig: Linter.Config = {}
  const additionalDependencies = {}

  const { pkg, files } = createESLintConfig({
    styleGuide: 'default',
    hasTypeScript: needsTypeScript,
    needsPrettier,
    additionalConfig,
    additionalDependencies
  })

  const scripts: Record<string, string> = {
    // Note that we reuse .gitignore here to avoid duplicating the configuration
    lint: needsTypeScript
      ? 'eslint . --ext .js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore'
      : 'eslint . --ext .js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore'
  }

  // Theoretically, we could add Prettier without requring ESLint.
  // But it doesn't seem to be a good practice, so we just leave it here.
  if (needsPrettier) {
    // Default to only format the `src/` directory to avoid too much noise, and
    // the need for a `.prettierignore` file.
    // Users can still append any paths they'd like to format to the command,
    // e.g. `npm run format cypress/`.
    scripts.format = 'prettier --write src/'
  }

  // update package.json
  const packageJsonPath = path.resolve(projectRoot, 'package.json')
  const existingPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const updatedPkg = sortDependencies(deepMerge(deepMerge(existingPkg, pkg), { scripts }))
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPkg, null, 2) + '\n', 'utf-8')

  // write to .eslintrc.cjs, .prettierrc.json, etc.
  for (const [fileName, content] of Object.entries(files)) {
    const fullPath = path.resolve(projectRoot, fileName)
    fs.writeFileSync(fullPath, content as string, 'utf-8')
  }

  // update .vscode/extensions.json
  // const extensionsJsonPath = path.resolve(projectRoot, '.vscode/extensions.json')
  // const existingExtensions = JSON.parse(fs.readFileSync(extensionsJsonPath, 'utf8'))
  // existingExtensions.recommendations.push('dbaeumer.vscode-eslint')
  // if (needsPrettier) {
  //   existingExtensions.recommendations.push('esbenp.prettier-vscode')
  // }
  // fs.writeFileSync(extensionsJsonPath, JSON.stringify(existingExtensions, null, 2) + '\n', 'utf-8')
}