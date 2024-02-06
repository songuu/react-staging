export default function getData({ oldData, deps }) {
  const plugins = []

  if (deps?.atomizationcss === 'windicss') {
    plugins.push({
      id: 'WindiCSSWebpackPlugin',
      importer: "import WindiCSSWebpackPlugin from 'windicss-webpack-plugin'",
      initializer: 'new WindiCSSWebpackPlugin()',
    })
  }

  return {
    plugins: plugins,
  }
}
