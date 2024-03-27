const webpack = require('webpack')

module.exports = {
  publicPath: './',
  configureWebpack: {
    plugins: [
      new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require('./public/vendor/vendor-manifest.json')
      }),
    ]
  }
}