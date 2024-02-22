#!/usr/bin/env node

import minimist from 'minimist'
import prompts from 'prompts'

export default init;

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

  let result: {
    projectName?: string
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
    ])
  } catch (e) { }
}