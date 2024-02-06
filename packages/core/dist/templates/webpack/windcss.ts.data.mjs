export default function getData() {
  return {
    plugins: [
      {
        id: 'WindiCSSWebpackPlugin',
        importer: "import WindiCSSWebpackPlugin from 'windicss-webpack-plugin'",
        initializer: 'new WindiCSSWebpackPlugin()'
      }
    ]
  }
}
