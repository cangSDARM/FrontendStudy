const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

//向外暴露一个打包对象. Node语法
module.exports = {
	mode: 'development', 	//development || production
	//在webpack 4.x 中. 默认打包入口路径是 `.src/index.js`
	entry: './src/app.js',

	plguins: [
		//将HTML文件托管到内存中
		htmlPlugin = new HtmlWebpackPlugin({
			template: path.join(__dirname, './src/index.html'),//源文件
			filename: 'index.html',	//内存文件名
		})
	]
}