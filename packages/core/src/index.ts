#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import ejs from 'ejs'
import minimist from 'minimist'
import prompts from 'prompts'
import { cyan, grey, red } from 'kleur/colors'

import { defaultToggleOptions, packageVersion } from './config'

import { postOrderDirectoryTraverse, preOrderDirectoryTraverse } from './utils/directoryTraverse'

import renderTemplate from './utils/renderTemplate'

import { __dirname } from './utils/paths'

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }

  postOrderDirectoryTraverse(
    dir,
    (dir: string) => fs.rmdirSync(dir),
    (file: string) => fs.unlinkSync(file)
  )
}

/* 
* 1. 使用命令拼装式创建项目
*    1. 是否使用ts
*    2. 是否使用eslint
*    3. 是否使用prettier
*    4. 是否使用husky
*    5. 是否使用lint-staged
*    6. 是否使用单元测试
*       1. 是否使用jest
*       2. 是否使用vitest
*    7. 使用管理工具
*       1. pnpm
*       2. yarn
*       3. npm
*    8. 使用构建工具
*       1. vite
*       2. webpack
*       3. rollup
*/

async function init() {
  console.log(`${grey(`create-staging`)}`)
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      force: 'f',
      help: 'h',
      version: 'v',
      ts: 'typescript',
      eslint: 'e',
      prettier: 'p',
      husky: 'h',
      'lint-staged': 'ls',
      'unit-testing': 'ut',
      jest: 'j',
      vitest: 'v',
    },
    string: ['_'],
    boolean: true
  })
  let targetDir = argv._[0]

  const defaultProjectName = !targetDir ? 'new-project' : targetDir

  const forceOverwrite = argv.force || argv.f

  const isFeatureFlagsUsed =
    typeof (
      argv.ts ||
      argv.typescript ||
      argv.eslint ||
      argv.prettier ||
      argv.husky ||
      argv['lint-staged'] ||
      argv['unit-testing'] ||
      argv.jest ||
      argv.vitest
    ) === 'boolean'

  let result: {
    projectName?: string
    needsTypeScript?: boolean
    needsEslint?: boolean
    needsPrettier?: boolean
    needsHusky?: boolean
    needsLintStaged?: boolean
    needsUnitTesting?: boolean
    needsJest?: boolean
    needsVitest?: boolean
    managementTool?: string
    buildTool?: string
  } = {}

  try {
    result = await prompts([
      {
        name: 'projectName',
        type: targetDir ? null : 'text',
        message: 'Project name:',
        initial: defaultProjectName,
        onState: (state) => (targetDir = String(state.value).trim() || defaultProjectName)
      },
      {
        name: 'needsTypeScript',
        type: () => (isFeatureFlagsUsed ? null : 'toggle'),
        message: 'Use TypeScript?',
        initial: defaultToggleOptions.inactive,
        active: defaultToggleOptions.active,
        inactive: defaultToggleOptions.inactive,
      },
      {
        name: 'needsEslint',
        type: () => (isFeatureFlagsUsed ? null : 'toggle'),
        message: 'Use ESLint?',
        initial: defaultToggleOptions.inactive,
        active: defaultToggleOptions.active,
        inactive: defaultToggleOptions.inactive,
      },
      {
        name: 'needsPrettier',
        type: () => (isFeatureFlagsUsed ? null : 'toggle'),
        message: 'Use Prettier?',
        initial: defaultToggleOptions.inactive,
        active: defaultToggleOptions.active,
        inactive: defaultToggleOptions.inactive,
      },
      {
        name: 'needsHusky',
        message: 'Use Husky?',
        type: () => (isFeatureFlagsUsed ? null : 'toggle'),
        initial: defaultToggleOptions.inactive,
        active: defaultToggleOptions.active,
        inactive: defaultToggleOptions.inactive,
      },
      {
        name: 'needsLintStaged',
        type: () => (isFeatureFlagsUsed ? null : 'toggle'),
        message: 'Use lint-staged?',
        initial: defaultToggleOptions.inactive,
        active: defaultToggleOptions.active,
        inactive: defaultToggleOptions.inactive,
      },
      {
        name: 'needsUnitTesting',
        type: () => (isFeatureFlagsUsed ? null : 'select'),
        message: 'Use unit testing?',
        hint: 'choose a testing framework',
        initial: 0,
        choices: () => [
          { title: 'No', value: false },
          { title: 'Jest', value: 'Jest' },
          { title: 'Vitest', value: 'Vitest' },
        ],
      },
      {
        name: 'managementTool',
        type: () => (isFeatureFlagsUsed ? null : 'select'),
        message: 'Use management tool?recommend pnpm.',
        hint: 'choose a management tool',
        initial: 0,
        choices: () => [
          { title: 'pnpm', value: 'pnpm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'npm', value: 'npm' },
        ],
      },
      {
        name: 'buildTool',
        type: () => (isFeatureFlagsUsed ? null : 'select'),
        message: 'Use build tool?recommend vite.',
        hint: 'choose a build tool',
        initial: 0,
        choices: () => [
          { title: 'vite', value: 'vite' },
          { title: 'webpack', value: 'webpack' },
          { title: 'rollup', value: 'rollup' },
        ],
      }
    ])
  } catch (error) {
    console.log(red(`\nOperation cancelled.`))
    process.exit(1)
  }

  const projectName = result.projectName || defaultProjectName
  const needsTypeScript = argv.ts || argv.typescript || result.needsTypeScript
  const needsEslint = argv.eslint || result.needsEslint
  const needsPrettier = argv.prettier || result.needsPrettier
  const needsHusky = argv.husky || result.needsHusky
  const needsLintStaged = argv['lint-staged'] || result.needsLintStaged
  const needsUnitTesting = argv['unit-testing'] || result.needsUnitTesting
  const needsJest = argv.jest || result.needsJest
  const needsVitest = argv.vitest || result.needsVitest
  const managementTool = result.managementTool
  const buildTool = result.buildTool

  const projectRoot = path.join(cwd, targetDir)

  if (forceOverwrite && fs.existsSync(projectRoot)) {
    emptyDir(projectRoot)
  } else if (!fs.existsSync(projectRoot)) {
    fs.mkdirSync(projectRoot)
  }

  const pkg = { name: projectName, version: packageVersion }
  fs.writeFileSync(path.resolve(projectRoot, 'package.json'), JSON.stringify(pkg, null, 2))

  const templateRoot = path.resolve(__dirname, 'templates')
  const callbacks: any[] = []
  const render = function render(templateName: string) {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, projectRoot, callbacks)
  }

  render('base')

  // 单独针对每一个选项自定义处理
  if (needsTypeScript) {
    render('config/typescript')

    render('tsconfig/base')

    // The content of the root `tsconfig.json` is a bit complicated,
    // So here we are programmatically generating it.
    const rootTsConfig = {
      // It doesn't target any specific files because they are all configured in the referenced ones.
      files: [],
      // All templates contain at least a `.node` and a `.app` tsconfig.
      references: [
        {
          path: './tsconfig.node.json'
        },
        {
          path: './tsconfig.app.json'
        }
      ]
    }

    if (needsJest) {
      render('tsconfig/jest')

      rootTsConfig.references.push({
        path: './tsconfig.jest.json'
      })
    }

    if (needsVitest) {
      render('tsconfig/vitest')

      rootTsConfig.references.push({
        path: './tsconfig.vitest.json'
      })
    }

    fs.writeFileSync(
      path.resolve(projectRoot, 'tsconfig.json'),
      JSON.stringify(rootTsConfig, null, 2) + '\n',
      'utf-8'
    )
  }

  // if (needsEslint) {
  //   render('eslint')
  // }

  // if (needsPrettier) {
  //   render('prettier')
  // }

  // if (needsHusky) {
  //   render('husky')
  // }

  // if (needsLintStaged) {
  //   render('lint-staged')
  // }

  if (needsUnitTesting) {
    if (needsJest) {
      render('jest')
    } else if (needsVitest) {
      render('config/vitest')
    }
  }

  // An external data store for callbacks to share data
  const dataStore: Record<string, any> = {}
  // Process callbacks
  for (const cb of callbacks) {
    await cb(dataStore)
  }

  // EJS template rendering
  // ejs 模板引擎转换
  preOrderDirectoryTraverse(
    projectRoot,
    () => { },
    (filepath) => {
      if (filepath.endsWith('.ejs')) {
        const template = fs.readFileSync(filepath, 'utf-8')
        const dest = filepath.replace(/\.ejs$/, '')
        const content = ejs.render(template, dataStore[dest])

        fs.writeFileSync(dest, content)
        fs.unlinkSync(filepath)
      }
    }
  )
}

init().catch((e) => {
  console.error(e)
})
