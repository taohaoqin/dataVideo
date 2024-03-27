const webpack = require('webpack');
const path = require('path');
const DllPlugin = webpack.DllPlugin;
const dllPath = 'public/vendor'
module.exports = {
  mode: 'production',
  entry: {
    vendor: [
      'vue',
      'vue-router',
      'vuex',
      'element-ui',
    ]
  },
  output: {
    path: path.join(__dirname, dllPath),
    filename: '[name].dll.js',
    // verdor.dll.js中暴露出的全局变量名，此处与 entry 中一致
    library: '[name]_[hash]'
    // 保持与webpack.DllPlugin中一致
  },
  plugins: [

    //  manifest.json描述动态链接库包含了哪些模块
    //  以及它们之间的依赖关系
    new DllPlugin({
      path: path.join(__dirname, dllPath, '[name]-manifest.json'),
      // 保持与output中一致
      name: '[name]_[hash]',
      context: process.cwd()
    })
  ],

}  