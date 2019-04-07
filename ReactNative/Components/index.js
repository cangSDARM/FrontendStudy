import React from 'react'
import { View, Image, TextInput } from 'react-native';

export default const Comp = (porps)=>{

	return <View>
		{/*
			RN 中父子组件传值依然使用props. 传值方式并没有改变
		*/}
		{props.name}
	</View>
}

//RN 的 事件
let Comps = ()=>{
	return <Image
		//加载成功时
		onLoad = {()=>{}}
		//加载结束后
		onLoadEnd = {()=>{}}
		//加载开始时
		onLoadStart = {()=>{}}
		//点击事件
		onPress = {()=>{}}
		//长按点击
		onLongPress = {()=>{}}
	>

	</Image>
}

//RN 的 Image 标签
//必需指定宽高和reseMode
let Images = ()=>{
	//本地
	source = require('./image.jpg');

	//网络 || base64
	//IOS只支持https
	source = {uri: 'https://www.baidu.com'}

	return 	<Image
		source={source}
		resizeMode={Image.resizeMode.cover}
	>
	{/*
		resizeMode:
			cover: 保持宽高比缩放, 裁剪
			contain: 保持宽高比缩放, 缩放
			stretch: 自动适应组件宽高, 拉伸
			repeat: 平铺 (只有IOS支持)
			center: 居中不拉伸
	*/}
	</Image>
}

//RN 的 TextInput
//类似于material-ui的Input组件
let TextInputs = ()=>{
	return <TextInput
		value: ""
		editable: {false}
		keyboardType: "numeric"
		placeholder: ""
		onChange = {(val)=>{
			//RN里没有e, 需要的value就直接是第一个参数
			console.log(val);
		}}
	/>
}