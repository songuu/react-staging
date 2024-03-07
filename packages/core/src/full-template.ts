#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { exec } from "child_process";

import minimist from 'minimist'
import prompts from 'prompts'
import { red, bold, cyan, green } from 'kleur/colors'
import ora from "ora";

import readPackageJson from './utils/readPackage'

import { emptyDir } from './utils/helper'

import { packageVersion } from './config'

import { getNpmPackage } from './utils/fileController'

import sortDependencies from './utils/sortDependencies'

import deepMerge from './utils/deepMerge'

import { projectLink } from './lib/constants'

async function init() {
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      force: 'f',
    },
    string: ['_'],
    boolean: true
  })
  let targetDir = argv._[0]
  const defaultProjectName = !targetDir ? 'new-project' : targetDir

  const forceOverwrite = argv.force || argv.f

  let result: {
    projectName?: string,
    projectType?: string,
    managementTool?: string
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
        name: 'projectType',
        type: 'select',
        message: 'Select features:',
        hint: 'choose the template you want to use',
        initial: 0,
        choices: [
          { title: 'react-vite', value: 'react-vite' },
          { title: 'react-webpack', value: 'react-webpack' }
        ]
      },
      {
        name: 'managementTool',
        type: 'select',
        message: 'Use management tool?recommend pnpm.',
        hint: 'choose a management tool',
        initial: 0,
        choices: () => [
          { title: 'pnpm', value: 'pnpm' },
          { title: 'yarn', value: 'yarn' },
          { title: 'npm', value: 'npm' },
        ],
      },
    ])
  } catch (e) {
    console.log(red(`\nOperation cancelled.`))
    process.exit(1)
  }

  const projectName = result.projectName || defaultProjectName
  const projectType = result.projectType || 'react-vite'
  const managementTool = result.managementTool || 'pnpm'

  const projectRoot = path.join(cwd, targetDir)

  if (forceOverwrite && fs.existsSync(projectRoot)) {
    emptyDir(projectRoot)
  } else if (!fs.existsSync(projectRoot)) {
    fs.mkdirSync(projectRoot)
  }

  const packages = readPackageJson(projectType)

  const pkg = { name: projectName, version: packageVersion, ...packages }

  // update package.json
  const packageJsonPath = path.resolve(projectRoot, 'package.json')
  await fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')

  // 下载 npm 包解压,并删除一些无用的代码文件
  await getNpmPackage(
    projectLink.get(projectType) as string,
    projectType,
    projectRoot
  );
  const spinner = ora().start();
  spinner.start(
    bold(cyan("The dependency package is being installed..."))
  );

  if (cwd !== projectRoot) {
    console.log(cyan('cd'), path.relative(cwd, projectRoot))
    exec('cd ' + path.relative(cwd, projectRoot), (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }

  exec(`${managementTool} install`, { cwd: projectRoot }, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }

    spinner.succeed(bold(green("🚀 Project initialization is complete")));

    console.log(stdout);
  });
}

export default init