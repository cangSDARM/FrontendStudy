// pages/index/index.js
Page{
	//页面初始数据
	data: {
		msg: "x",	//调用: index.wxml --> {{msg}}
		//wxml中类似于React, {{}} 会转化为js语法
		//	支持
		//		...展开
		//		key, value同名省略
		//在标签中, 还要加"":
		//	<view data-id="{{msg}}"></view>
		//	<checkbox clecked="{{false}}"></checkbox>
	},

//页面生命周期函数
	//监听页面加载
	onLoad: function(options){

	},

	//生命周期函数
	//监听页面初次渲染完成
	onReady: function(){

	},

	//页面显示/切入前台时触发
	onShow() {

	},

	//页面隐藏/切入后台时触发
	onHide() {

	},

	//页面卸载时触发
	onUnload() {

	},

//页面事件处理函数
	//监听用户下拉刷新事件
	onPullDownRefresh() {

	},

	//监听用户上拉触底事件
	onReachBottom() {

	},

	//监听用户点击页面内转发按钮
	onShareAppMessage() {
	// return custom share data when user share.
	},

	//监听用户滑动页面事件
	onPageScroll() {

	},

	//小程序屏幕旋转时触发
	onResize() {
	// Do something when page resize
	},

	//点击 tab 时触发
	onTabItemTap(item) {
		console.log(item.index)
		console.log(item.pagePath)
		console.log(item.text)
	},

//标签事件处理函数
	//绑定: <view bindtap="viewTap">click me</view>
	viewTap() {
		//该页route
		console.log(this.route)

		//和React的setState一个用处
		this.setData({
			text: 'Set some data for updating view.',
			// 对于对象或数组字段，可以直接修改一个其下的子字段，这样做通常比修改整个对象或数组更好
      		'array[0].text': 'changed data',
		}, function () {
			// this is setData callback
		})
	},
}