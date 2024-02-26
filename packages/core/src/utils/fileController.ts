import { bold, cyan, grey, red, green } from 'kleur/colors'
import ora from "ora";
import fs from "fs-extra";
import tar from "tar";
import axios from "axios";
import { join } from "node:path";
import { resolveApp } from "./paths";
import { packageVersion } from "../config";

/**
 * @param router 删除文件的路径,默认 node_modules
 * @param flag 如果为真则显示删除信息
 */
export function removeDirectory(router = "node_modules", flag = true) {
  if (flag === true) {
    const spinner = ora().start();
    spinner.start(bold("File being deleted..."));
    try {
      fs.removeSync(resolveApp(`${router}`));
    } catch (error) {
      console.log(error);
    }
    spinner.succeed(bold(green("deleted successfully")));
  }
  fs.removeSync(resolveApp(`${router}`));
}

async function copyFolderRecursive(sourceDir: string, destinationDir: string) {
  try {
    await fs.ensureDir(destinationDir); // 确保目标目录存在，如果不存在则创建
    await fs.copy(sourceDir, destinationDir); // 复制源目录下的文件到目标目录
  } catch (error) {
    console.log(
      red("\n 模板下载过程中可能出现网络错误,请重新尝试")
    );
    process.exit(0);
  }
}

export async function getNpmPackage(
  packageURL: string,
  packageName: string,
  matter: string
): Promise<void> {
  const spinner = ora().start();
  spinner.start(bold(cyan("Creating a project...")));
  axios
    .get(packageURL, { responseType: "arraybuffer" })
    .then(async (response: any) => {
      // 获取当前终端目录
      const currentDir = resolveApp(matter);

      // 保存 .tgz 包为文件
      const tgzPath = join(currentDir, `${packageName}-${packageVersion}.tgz`);
      fs.writeFileSync(tgzPath, response.data);

      // 解压缩 .tgz 包到当前终端目录
      tar.extract({
        file: tgzPath,
        cwd: currentDir,
        sync: true,
      });

      // 删除临时的 .tgz 文件
      fs.unlinkSync(tgzPath);
      await copyFolderRecursive(join(matter, "package/template"), matter);

      removeDirectory(join(matter, "package"), false);
      
      spinner.succeed(bold(green("Project creation successfully")));
    })
    .catch((error: any) => {
      console.error("Error:", error);
    });
}
