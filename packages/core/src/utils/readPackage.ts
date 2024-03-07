import getPackageJsonInfo from "./getPackageInfo";

function readPackageJson(projectType: string) {
  const packageInfo = getPackageJsonInfo(
    `../template-config/${projectType}.json`,
    true
  );

  return packageInfo;
}

export default readPackageJson;
