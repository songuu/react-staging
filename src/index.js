#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import { bold, cyan, grey, red, blue } from 'kleur/colors'
import minimist from 'minimist'

import * as langAll from './lang'

const { version } = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
)

console.log(`
${grey(`create-staging@${version}
`)}`)

const spinner = p.spinner()

p.intro('Welcome to use staging!')

let lang = langAll.en_US

// 语言列表
// Language list
const languages = []

// 循环 langAll 对象，将语言列表中的语言名字替换为对应的语言名字，且按照 sort 排序
for (const key in langAll) {
  languages.push({
    value: key,
    label: langAll[key].name,
    sort: langAll[key].sort,
  })
}

// 按照 sort 排序
// Sort by sort
languages.sort((a, b) => a.sort - b.sort)

/*
 * 步骤
 * 1. 获取命令行参数
 *   1.1. 获取项目名称和模板名称和语言【需要指定，默认react】
 *   1.2. 命令行中有项目名称，但是没有模板名称，使用默认的模板
 *   1.3. 命令行中有项目名称，又有模板名称，使用指定的模板
 *   1.4. 命令行中没有项目名称，也没有模板名称，使用交互式命令行
 *      1.4.1. 选择语言
 *      1.4.2. 选择模板
 */

const argv = minimist(process.argv.slice(2))

const argvProjectName = argv._[0]
const argvTemplate = argv.template || argv.t
const argvLanguage = argv.language || argv.l

// 如果命令行参数中有语言，且语言列表中有该语言，使用该语言，否则使用英语
lang =
  argvLanguage && languages.find((item) => item.value === argvLanguage)
    ? langAll[argvLanguage]
    : langAll.en_US

const templateOptions = [
  {
    value: 'vtr',
    label: 'React + Vite + Tailwind',
    template: 'react-vite-tailwind',
    finish: true,
  },
]

if (argvProjectName && !argvTemplate) {
  createFunc(argvProjectName, templateOptions[0])
} else if (argvProjectName && argvTemplate) {
  const item = templateOptions.find((item) => item.value === argvTemplate)
  if (!item) {
    p.intro(red(lang.pectn))
  } else if (!item.finish) {
    p.intro(red(item.label + ' ' + lang.hnay))
  } else {
    createFunc(argvProjectName, item)
  }
} else {
  ;(async () => {
    const languageType = await p.select({
      message: bold('Please select your preferred language'),
      options: languages,
    })

    if (p.isCancel(languageType)) {
      p.cancel(red('⛔ ') + lang.oc)
      process.exit(0)
    }
    lang = langAll[languageType]

    let template = await p.select({
      message: bold(lang.psat),
      options: templateOptions,
    })

    if (p.isCancel(template)) {
      p.cancel(red('⛔ ') + lang.oc)
      process.exit(0)
    }

    while (!templateOptions.find((item) => item.value === template)?.finish) {
      if (p.isCancel(template)) {
        p.cancel(red('⛔ ') + lang.oc)
        process.exit(0)
      }

      p.intro(
        red(
          templateOptions.find((item) => item.value === template).label +
            ' ' +
            lang.hnay +
            ' ' +
            lang.pca
        )
      )
      template = await p.select({
        message: bold(lang.psat),
        options: templateOptions,
      })
    }

    // 输入项目名称
    const projectName = await p.text({
      message: bold(lang.pn),
      placeholder: 'staging-project',
      validate: (value) => {
        if (!value) {
          // 判断是否为空，提示 “项目名称不能为空”
          return lang.pncbne
        }
        if (fs.existsSync(value)) {
          // 判断是否已存在，提示 “项目名称已存在”
          return lang.pane
        }
      },
    })

    if (p.isCancel(projectName)) {
      p.cancel(red('⛔ ') + lang.oc)
      process.exit(0)
    }

    // 根据 template 的值，复制对应目录下的所有文件到当前目录
    templateOptions.forEach(async (item) => {
      if (item.value === template) {
        createFunc(projectName, item)
      }
    })
  })()
}

// * 将现有的配置文件直接复制到当前目录
function createFunc(projectName, item) {
  // 如果 projectName 是数字，转为字符串
  if (typeof projectName === 'number') {
    projectName = projectName.toString()
  }

  // 项目目录
  const projectDir = path.join(path.resolve(), projectName)

  spinner.start('🚀 ' + lang.cfsing)

  fs.mkdirSync(projectDir)

  // 获取模板目录的绝对路径，考虑到 Windows 系统的兼容性, 使用 path.join

  const templatePath = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `templates/${item.template}`
  )

  fs.copy(templatePath, projectDir)
    .then(() => {})
    .catch((err) => {
      spinner.stop()
      console.error(red(lang.cferror + '--' + err))
    })
}
