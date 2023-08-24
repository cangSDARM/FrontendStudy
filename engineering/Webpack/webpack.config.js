const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

//向外暴露一个打包对象. Node语法
module.exports = {
  context: __dirname, // Webpack 使用的根目录，string 类型必须是绝对路径
  mode: "development", //development || production
  entry: "./src/app.js",
  output: {
    filename: 'bundle.js', //打包输出的文件名
    path: path.resolve(__dirname,'dist') // 打包输出的路径（必须是绝对路径）
  },

  plugins: [
    //将HTML文件托管到内存中
    (htmlPlugin = new HtmlWebpackPlugin({
      template: path.join(__dirname, "./src/index.html"), //源文件
      filename: "index.html", //内存文件名
    })),
  ],

  modules: {
    rules: [
      //第三方匹配规则 (webpack 本身只能解析.js和.json文件)
      {
        test: /\.css%/,
        exclude: /node_modules/,
        include: path.resolve('src'),
        use: [
          "style-loader",
          "css-loader?modules&localIdentName=[loacl]-[hash:5]",
        ],
      },
    ],
  },

  resolve: {
    // 寻找模块的根目录，array 类型，默认以 node_modules 为根目录
    modules: [
      'node_modules',
      path.resolve(__dirname, 'app')
    ],
    //可以省略后缀名的。 默认： js、 json
    extensions: [".js", ".jsx", ".json"],
    alias: {
      //设置目录别名
      "@": path.join(__dirname, "./src"),
    },
  },

  // 输出文件性能检查配置
  performance: {
    hints: 'error', // 有性能问题时输出错误
    maxAssetSize: 200000, // 最大文件大小 (单位 bytes)
    maxEntrypointSize: 400000, // 最大入口文件大小 (单位 bytes)
    assetFilter: function(assetFilename) { // 过滤要检查的文件
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  },
};

添加jq支持: plugins: [
  //ProvidePlugin可以自动加载模块, 无需import或require
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    "window.jQuery": "jquery",
  }),
];
resolve: {
  alias: {
    jquery: "jquery";
  }
}
entry: {
  vendor: ["jquery"];
}
