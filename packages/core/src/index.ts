#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

import ejs from 'ejs'
import minimist from 'minimist'
import prompts from 'prompts'
import { cyan, grey, red, bold, green } from 'kleur/colors'

import { defaultToggleOptions, packageVersion } from './config'

import { postOrderDirectoryTraverse, preOrderDirectoryTraverse } from './utils/directoryTraverse'

import renderTemplate from './utils/renderTemplate'

import renderEslint from './utils/renderEslint'

import { __dirname } from './utils/paths'

import getCommand from './utils/getCommand'

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
*       1. 不使用
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
*    9. 原子化css
*       1. 不使用
*       2. 使用tailwindcss
*       3. 使用windicss
*       4. 使用unocss
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
    buildTool?: string,
    atomizationcss?: string
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
      },
      {
        name: 'atomizationcss',
        type: () => (isFeatureFlagsUsed ? null : 'select'),
        message: 'Use atomization css?',
        hint: 'choose a atomization css',
        initial: 0,
        choices: () => [
          { title: 'No', value: false },
          { title: 'tailwindcss', value: 'tailwindcss' },
          { title: 'windicss', value: 'windicss' },
          { title: 'unocss', value: 'unocss' }
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
  const managementTool = result.managementTool || 'pnpm'
  const buildTool = result.buildTool || 'vite'
  const atomizationcss = result.atomizationcss || false

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
    renderTemplate(templateDir, projectRoot, callbacks, JSON.stringify(result))
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

  if (needsEslint) {
    renderEslint(projectRoot, {
      needsTypeScript,
      needsPrettier
    })
  }

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
      render('config/jest')
    } else if (needsVitest) {
      render('config/vitest')
    }
  }

  if (atomizationcss) {
    switch (atomizationcss) {
      case 'tailwindcss':
        render('config/tailwindcss')
        render('entry/tailwindcss')
        break
      case 'windicss':
        render('config/windicss')
        render('windicss/base')
        break
      case 'unocss':
        render('config/unocss')
        render('unocss')
        break
      default:
        break
    }
  }

  render("entry/default")
  render("code/router")

  switch (buildTool) {
    case 'vite':
      render('config/vite')
      render('vite')
      break
    case 'webpack':
      render('config/webpack')
      render('webpack/base')
      break
    case 'rollup':
      render('config/rollup')
      render('rollup')
      break
    default:
      break
  }

  // An external data store for callbacks to share data
  const dataStore: Record<string, any> = {}
  // Process callbacks
  for (const cb of callbacks) {
    await cb(dataStore)
  }

  /* 
  * ejs 模板引擎转换
  * 将html和js文件中的ejs模板引擎转换为对应的文件
  * 1. 主要是因为一个项目一般只有一个html文件，所以这里直接转换
  */
  preOrderDirectoryTraverse(
    projectRoot,
    () => { },
    (filepath) => {
      if (filepath.endsWith('.ejs')) {
        const template = fs.readFileSync(filepath, 'utf-8')
        const dest = filepath.replace(/\.ejs$/, '')

        let content = '';

        if (dest.includes('html')) {
          content = ejs.render(template, {
            title: projectName,
            buildTool,
            needsTypeScript
          })
        } else {
          content = ejs.render(template, dataStore[dest])
        }


        fs.writeFileSync(dest, content)
        fs.unlinkSync(filepath)
      }
    }
  )

  if (needsTypeScript) {
    preOrderDirectoryTraverse(projectRoot, (dir) => { }, (filepath) => {
      if (filepath.endsWith('.js')) {
        const tsFilePath = filepath.replace(/\.js$/, '.ts')
        if (fs.existsSync(tsFilePath)) {
          fs.unlinkSync(filepath)
        } else {
          fs.renameSync(filepath, tsFilePath)
        }
      } else if (path.basename(filepath) === 'jsconfig.json') {
        fs.unlinkSync(filepath)
      }
    })

    // Rename entry in `index.html`
    const indexHtmlPath = path.resolve(projectRoot, 'index.html')
    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8')
    fs.writeFileSync(indexHtmlPath, indexHtmlContent.replace('src/main.js', 'src/main.ts'))
  } else {
    preOrderDirectoryTraverse(
      projectRoot,
      () => { },
      (filepath) => {
        if (filepath.endsWith('.ts')) {
          fs.unlinkSync(filepath)
        }
      }
    )
  }

  if (cwd !== projectRoot) {
    console.log(cyan('cd'), path.relative(cwd, projectRoot))
  }

  console.log(bold(green(getCommand(managementTool, 'install'))))

  if (needsPrettier) {
    console.log(bold(green(getCommand(managementTool, 'format'))))
  }

  console.log(bold(green(getCommand(managementTool, 'dev'))))

  console.log()
}

init().catch((e) => {
  console.error(e)
})
