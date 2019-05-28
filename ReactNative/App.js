import React, {Component} from 'react';
import {
	Platform,
	StyleSheet,
	Text,
	View,
	Image
} from 'react-native';

//平台内容通过Platform获取
//Platform.OS === "ios" ? "android"
const instructions = Platform.select({
	ios: 'Press Cmd+R to reload, \n'+
		'Cmd+D or shake for dev menu',
	android: 'Double tap R on your keyboard to reload, \n'+
		'Shake or press menu button for dev menu',
});
//在style中:
...Platform.select({
  ios: {
    backgroundColor: "red"
  },
  android: {
    backgroundColor: "blue"
  }
})
//在组件中:
const Component = Platform.select({
  ios: () => require("ComponentIOS"),
  android: () => require("ComponentAndroid")
})();
//版本:
//在 Android 上，Version属性是一个数字, 表示 Android 的 api level
Platform.Version === 25
//在 iOS 上，Version属性是-[UIDevice systemVersion]的返回值, 一个字符串
parseInt(Platform.Version, 10);

//特定平台代码:
//定义:
// BigButton.ios.js
// BigButton.android.js
// 然后去掉平台扩展名直接引用:
import BigButton from './BigButton';
// 将会自动根据平台导入

//获取屏幕参数
let screen = Dimensions.get('window');

export default class App extends Component<{}>{
	constructor(){
		//生命周期都一样
		super();

		//依然使用state和setState来控制状态
		this.state = {};

		//alert是个题目为alert的弹窗
		alert('APP');
	}
	render(){
		return (
			<View style={styles.container}>
				<Text style={{fontSize: 20, textAlign: 'center'}}>
					RN 的 纯文本 必须写在 Text 组件中
				</Text>
				{/*
					RN的style连接不需要.join
				*/}
				<Text style={[styles.instructions, styles.add]}>
					{instructions}
				</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		//撑满外层容器.(这里是整个屏幕)
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	instructions: {
		marginBottom: 5,
		color: '#333333'
	},
	add: {
		//的尺寸都是无单位的, 表示的是与设备像素密度无关的逻辑像素点
		fontSize: 2,
	}
})