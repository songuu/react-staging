import * as fs from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'child_process';
import compareVersions from 'version-compare';

import { __dirname } from './paths'

// 检测包管理工具
const detectPackageManager = () => {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch (error) {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch (error) {
      return 'npm';
    }
  }
};

// 获取当前脚手架版本
function getCurrentVersion() {
  const packageJsonPath = path.join(__dirname, '../../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return {
    version: packageJson.version || '',
    name: packageJson.name || ''
  };
}

// 获取最新脚手架版本信息
function getLatestVersionInfo(packageName: string) {
  try {
    const latestVersion = execSync(`npm show ${packageName} version`).toString().trim();
    const forceUpdate = execSync(`npm show ${packageName} forceUpdate`).toString().trim() === 'true';
    return { version: latestVersion, forceUpdate };
  } catch (error) {
    console.error('Error fetching the latest version from npm:', error);
    return null;
  }
}

// 比较版本
function checkForUpdates(currentVersion: string, latestVersion: string) {
  return compareVersions(currentVersion, latestVersion) <= 0;
}

// 处理更新逻辑
async function handleUpdate() {
  const { version: currentVersion, name } = getCurrentVersion();
  const latestVersionInfo = getLatestVersionInfo(name); // 替换为你的包名

  if (!latestVersionInfo) {
    console.log('无法获取最新版本信息');
    return;
  }

  const { version: latestVersion, forceUpdate } = latestVersionInfo;

  if (checkForUpdates(currentVersion, latestVersion)) {
    if (forceUpdate) {
      console.log(`当前版本 ${currentVersion} 已过期，请更新到最新版本 ${latestVersion}。这是强制更新，更新后才能继续使用。`);
      const packageManager = detectPackageManager();
      let updateCommand;

      switch (packageManager) {
        case 'yarn':
          updateCommand = 'yarn global add';
          break;
        case 'pnpm':
          updateCommand = 'pnpm add -g';
          break;
        default:
          updateCommand = 'npm install -g';
      }

      try {
        execSync(`${updateCommand} ${name}`, { stdio: 'inherit' });
        console.log('脚手架已成功更新到最新版本。');
      } catch (error) {
        console.error('更新失败:', error);
      }

      // process.exit(1); // 退出脚手架，强制用户更新
    } else {
      console.log(`发现新版本 ${latestVersion}。当前版本 ${currentVersion}。建议更新以获得最新功能和修复。`);
    }
  } else {
    console.log('当前版本已是最新版本。');
  }
}

export default handleUpdate;
