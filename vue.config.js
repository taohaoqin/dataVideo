const webpack = require('webpack')

module.exports = {
  publicPath: './',
  configureWebpack: {
    devtool: false,
    optimization: {
      minimize: true, // 压缩代码
      splitChunks: {
        chunks: 'all', // 代码分割
        cacheGroups: {
          libs: {
            chunks: 'all', // 代码分割
            name: 'chunk-libs', // 缓存组的名字
            test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 目录
            priority: 1, // 这个配置项设置了 libs 这个缓存组的优先级，数字越大，优先级越高，被打包到 libs 缓存组里
            // chunks: 'initial', // 这个配置项设置了 libs 缓存组只打包初始的 chunks
            // minChunks: 1,
          },
          common: {
            chunks: 'all', // 代码分割
            name: 'chunk-common', // 缓存组的名字
            // minChunks: 2,
            priority: 5,
            // reuseExistingChunk: true // 复用已有的 chunk
          }
        }
      }
    },
    plugins: [
      new webpack.DllReferencePlugin({
        context: process.cwd(),
        manifest: require('./public/vendor/vendor-manifest.json')
      }),
    ]
  }
}