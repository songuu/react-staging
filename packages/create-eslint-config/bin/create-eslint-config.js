#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { bold, blue, yellow, red, green, dim } from 'kolorist'

import createConfig, {
  deepMerge,
  CREATE_ALIAS_SETTING_PLACEHOLDER,
} from '../index.js'

const require = createRequire(import.meta.url)
const Enquirer = require('enquirer')
const enquirer = new Enquirer()

function abort() {
  console.error(red('✖') + ' Operation cancelled')
  process.exit(1)
}

function prompt(questions) {
  return enquirer.prompt(questions).catch(abort)
}

const cwd = process.cwd()
const requireInCwd = createRequire(path.resolve(cwd, 'index.cjs'))

// Only works in directories that has a `package.json`
const pkgJsonPath = path.resolve(cwd, 'package.json')
if (!existsSync(pkgJsonPath)) {
  console.error(
    `${bold(yellow('package.json'))} not found in the current directory.`
  )
  abort()
}

const rawPkgJson = readFileSync(pkgJsonPath, 'utf-8')
function inferIndent(rawJson) {
  const lines = rawJson.split('\n')
  const firstLineWithIndent = lines.find(
    (l) => l.startsWith(' ') || l.startsWith('\t')
  )

  if (!firstLineWithIndent) {
    return ''
  }
  return /^\s+/.exec(firstLineWithIndent)[0]
}
const indent = inferIndent(rawPkgJson)
const pkg = JSON.parse(rawPkgJson)

// 1. check for existing config files
// `.eslintrc.*`, `eslintConfig` in `package.json`
// ask if wanna overwrite?

// https://eslint.org/docs/latest/user-guide/configuring/configuration-files#configuration-file-formats
// The experimental `eslint.config.js` isn't supported yet
const eslintConfigFormats = ['js', 'cjs', 'yaml', 'yml', 'json']
for (const fmt of eslintConfigFormats) {
  const configFileName = `.eslintrc.${fmt}`
  const fullConfigPath = path.resolve(cwd, configFileName)
  if (existsSync(fullConfigPath)) {
    const { shouldRemove } = await prompt({
      type: 'toggle',
      disabled: 'No',
      enabled: 'Yes',
      name: 'shouldRemove',
      message:
        `Found existing ESLint config file: ${bold(blue(configFileName))}.\n` +
        'Do you want to remove the config file and continue?',
      initial: false,
    })

    if (shouldRemove) {
      unlinkSync(fullConfigPath)
    } else {
      abort()
    }
  }
}

if (pkg.eslintConfig) {
  const { shouldRemoveConfigField } = await prompt({
    type: 'toggle',
    disabled: 'No',
    enabled: 'Yes',
    name: 'shouldRemoveConfigField',
    message:
      `Found existing ${bold(blue('eslintConfig'))} field in ${bold(yellow('package.json'))}.\n` +
      'Do you want to remove the config field and continue?',
    initial: false,
  })

  if (shouldRemoveConfigField) {
    delete pkg.eslintConfig
  }
}

// 2. Choose a style guide
// - Error Prevention (ESLint Recommended)
// - Standard
// - Airbnb
const { styleGuide } = await prompt({
  type: 'select',
  name: 'styleGuide',
  message: 'Which style guide do you want to follow?',
  choices: [
    {
      name: 'default',
      message: 'ESLint Recommended (Error-Prevention-Only)',
    },
    {
      name: 'airbnb',
      message: `Airbnb ${dim('(https://airbnb.io/javascript/)')}`,
    },
    {
      name: 'standard',
      message: `Standard ${dim('(https://standardjs.com/)')}`,
    },
  ],
})

// 3. Check TypeScript
// 3.1 Allow JS?
let hasTypeScript = false
const additionalConfig = {}
try {
  const tsVersion = requireInCwd('typescript/package.json').version
  console.info(dim(`Detected TypeScript version: ${tsVersion}`))
  hasTypeScript = true
} catch (e) {
  const anwsers = await prompt({
    type: 'toggle',
    disabled: 'No',
    enabled: 'Yes',
    name: 'hasTypeScript',
    message: 'Does your project use TypeScript?',
    initial: false,
  })
  hasTypeScript = anwsers.hasTypeScript
}

// 5. If Airbnb && !TypeScript
// Does your project use any path aliases?
// Show [snippet prompts](https://github.com/enquirer/enquirer#snippet-prompt) for the user to input aliases
if (styleGuide === 'airbnb' && !hasTypeScript) {
  const { hasAlias } = await prompt({
    type: 'toggle',
    disabled: 'No',
    enabled: 'Yes',
    name: 'hasAlias',
    message: 'Does your project use any path aliases?',
    initial: false,
  })

  if (hasAlias) {
    console.info()
    console.info(
      `Please input your alias configurations (press ${bold(green('<Enter>'))} to skip):`
    )

    const aliases = {}
    while (true) {
      console.info()

      const { prefix } = await prompt({
        type: 'input',
        name: 'prefix',
        message: 'Alias prefix',
        validate: (val) => {
          if (Object.hasOwn(aliases, val)) {
            return red(
              `${green(val)} has already been aliased to ${green(aliases[val])}`
            )
          }

          return true
        },
      })

      if (!prefix) {
        break
      }

      const { replacement } = await prompt({
        type: 'input',
        name: 'replacement',
        message: `Path replacement for the prefix ${green(prefix)}`,
        validate: (value) => value !== '',
      })

      aliases[prefix] = replacement
    }
    if (Object.keys(aliases).length > 0) {
      additionalConfig.settings = {
        [CREATE_ALIAS_SETTING_PLACEHOLDER]: aliases,
      }
    }

    console.info()
  }
}

// 6. Do you need Prettier to format your codebase?
const { needsPrettier } = await prompt({
  type: 'toggle',
  disabled: 'No',
  enabled: 'Yes',
  name: 'needsPrettier',
  message: 'Do you need Prettier to format your code?',
})

const { pkg: pkgToExtend, files } = createConfig({
  styleGuide,
  hasTypeScript,
  needsPrettier,

  additionalConfig,
})

deepMerge(pkg, pkgToExtend)

// Write `package.json` back
writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, indent) + '\n', 'utf-8')
// Write files back
for (const [name, content] of Object.entries(files)) {
  const fullPath = path.resolve(cwd, name)
  writeFileSync(fullPath, content, 'utf-8')
}

// Prompt: Run `npm install` or `yarn` or `pnpm install`
const userAgent = process.env.npm_config_user_agent ?? ''
const packageManager = /pnpm/.test(userAgent)
  ? 'pnpm'
  : /yarn/.test(userAgent)
    ? 'yarn'
    : 'npm'

const installCommand =
  packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
const lintCommand =
  packageManager === 'npm' ? 'npm run lint' : `${packageManager} lint`

console.info(
  '\n' +
    `${bold(yellow('package.json'))} and ${bold(blue('.eslintrc.cjs'))} have been updated.\n` +
    `Now please run ${bold(green(installCommand))} to re-install the dependencies.\n` +
    `Then you can run ${bold(green(lintCommand))} to lint your files.`
)
