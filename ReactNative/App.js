import React, {Component} from 'react';
import {
	Platform,
	StyleSheet,
	Text,
	View,
	Image
} from 'react-native';

const instructions = Platform.select({
	ios: 'Press Cmd+R to reload, \n'+
		'Cmd+D or shake for dev menu',
	android: 'Double tap R on your keyboard to reload, \n'+
		'Shake or press menu button for dev menu',
});

export default class App extends Component<{}>{
	constructor(){
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
		fontSize: 2,
	}
})