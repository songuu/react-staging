const template: string[] = [
  "react-vite", "react-webpack"
];

export const packageVersion = "1.0.1";

function getProjectLink(templates: string[]): Map<string, string> {
  const map = new Map();
  templates.forEach((template: string) => {
    map.set(
      template,
      `https://registry.npmjs.org/@songyulala/template-${template}-${packageVersion}.tgz`
    );
  });
  return map;
}

export const projectLink: Map<string, string> = new Map(
  getProjectLink(template)
);
