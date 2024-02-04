#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'

import { getCliPackageInfo } from '../lib/index.js'

const program = new Command()

program.version(chalk.greenBright(getCliPackageInfo.version))
