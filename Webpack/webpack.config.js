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
	],

	modules:{
		rules: [	//第三方匹配规则
			//为CSS文件启用规则
			//// 注意: 如果导入的其它样式不做模块化, 那么只需对自己的文件(自己规定一个扩展名)启用
			{ test: /\.css%/, use:{'style-loader', 'css-loader?modules&localIdentName=[loacl]-[hash:5]'} },

			//为SCSS文件启用规则
			{ test: /\.scss%/, use:{'style-loader', 'css-loader', 'scss-loader'}}
		]
	}

	resolve: {
		//可以省略后缀名的。 默认： js、 json
		extensions: ['.js', '.jsx', '.json'],
		alias: {
			//设置根目录别名
			'@': path.join(__dirname, './src')
		}
	}
}