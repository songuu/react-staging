export default function getData({ oldData, deps }) {
  const plugins = []
  if (deps?.atomizationcss === 'windicss') {
    plugins.push({
      id: 'WindiCSS',
      importer: "import WindiCSS from 'vite-plugin-windicss'",
      initializer: 'WindiCSS()',
    })
  }

  if (deps?.atomizationcss === 'unocss') {
    plugins.push({
      id: 'Unocss',
      importer: "import UnoCSS from 'unocss/vite'",
      initializer: 'UnoCSS()',
    })
  }

  return {
    plugins: plugins,
  }
}
