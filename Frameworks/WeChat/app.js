//App() 必须在 app.js 中调用，必须调用且只能调用一次。不然会出现无法预期的后果

//注册小程序
App({
	//小程序初始化完成时触发，全局只触发一次
	onLaunch(options) {
		// Do something initial when launch.
	},

	//小程序启动，或从后台进入前台显示时触发
	onShow(options) {
		// Do something when show.
	},

	//小程序从前台进入后台时触发
	onHide() {
		// Do something when hide.
	},

	//小程序发生脚本错误或 API 调用报错时触发
	onError(msg) {
		console.log(msg)
	},
	globalData: 'I am global data'
})

//调用:
//const appInstance = getApp()


//JS 导入和导出:
//导出:
//	module.exports.sayHello = sayHello
//导入:
//	const common = require('common.js')
//	common.sayHello


//小程序 API 全局对象，用于承载小程序能力相关 API
wx.canIUse()