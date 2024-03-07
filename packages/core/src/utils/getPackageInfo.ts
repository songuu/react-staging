import { readFileSync } from "node:fs";
import { join } from "node:path";

import { __dirname } from './paths'

type PackageJson = any;

function getPackageJsonInfo(
  target: string,
  isCliPackageJson: boolean
): PackageJson {
  return JSON.parse(
    readFileSync(isCliPackageJson ? join(__dirname, target) : target).toString()
  ) as PackageJson;
}

export default getPackageJsonInfo;
