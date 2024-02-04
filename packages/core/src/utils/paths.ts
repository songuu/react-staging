import path from 'path'
import fs from "node:fs";
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath: string) {
  return path.resolve(appDirectory, relativePath);
}

export {
  __filename,
  __dirname,
  resolveApp
}