export default function getData({ oldData, deps }) {
  const plugins = []
  if (deps?.atomizationcss === 'windicss') {
    plugins.push({
      id: 'WindiCSS',
      importer: "import WindiCSS from 'rollup-plugin-windicss'",
      initializer: 'WindiCSS()',
    })
  }

  return {
    plugins: plugins,
  }
}
