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

//Image
//必需指定宽高和reseMode
let Images = ()=>{
	//本地. 静态字符串
	// 定义:
	//	 不同精度图片, 对平台自适应
	//	 	check.png
	//	 	check@2x.png
	//	 	check@3x.png
	//	 不同平台
	//	 	check.android.png
	//	 	check.ios.png
	// 导入:
	// 	check.png
	//需要提供resizeMode
	source = require('./image.jpg');

	//网络 || base64
	//混合 App:
	//	Xcode 的 asset 类目中, 或者在 Android 的 drawable 目录里
	//	source={{uri: 'app_icon'}} 不带路径和后缀
	//Android 的 assets:
	//	source={{uri: 'asset:/app_icon.png'}}
	//需要指定尺寸
	source = {uri: 'https://www.baidu.com'}

	//请求
	source={
	    uri: 'https://facebook.github.io/react/logo-og.png',
	    method: 'POST',
	    headers: {
	      Pragma: 'no-cache',
	    },
	    body: 'Your Body goes here',
	}

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

//ImageBackground
//背景图实现
//和Image一样的api
<ImageBackground>
	<Text>Inside</Text>
</ImageBackground>

//TextInput
//类似于material-ui的Input组件
<TextInput
	value: ""
	editable: {false}
	keyboardType: "numeric"
	placeholder: ""
	onChange = {(val)=>{
		//RN里没有e, 需要的value就直接是第一个参数
		console.log(val);
	}}
/>

//ScrollView
// 支持双指放大
// 加载完了再render, 不适合量大的内容
<ScrollView>

</ScrollView>

//FlatList
// 支持下拉刷新
<FlatList
	data={[xx, xx]}
	renderItem={({item})=><Text>{item.key}</Text>}
/>

//SectionList
// 需要分组的数据
<SectionList
  sections={[
    {title: 'D', data: ['Devin']},
    {title: 'J', data: ['Jackson', 'Jimmy', 'Julie']},
  ]}
  renderItem={({item})=><Text>{item}</Text>}
  renderSectionHeader={({section})=><Text}>{section.title}</Text>}
  keyExtractor={(item, index)=>index}
/>

//Touchable 系列
//这个组件的样式是固定的
let Touchable = ()=>{
	//此组件的背景会在用户手指按下时变暗
	let th = <TouchableHighlight
		onPress={this._onPressButton}
		underlayColor="white"
	>
      <View>
        <Text>Highlight</Text>
      </View>
    </TouchableHighlight>

    //按下时形成类似墨水涟漪的视觉效果
    //only android
    let tnf = <TouchableNativeFeedback
	    onPress={this._onPressButton}
	    background={Platform.OS === 'android' ? TouchableNativeFeedback.SelectableBackground() : ''}
	>
	  <View>
	    <Text>TouchableNativeFeedback</Text>
	  </View>
	</TouchableNativeFeedback>

	//按下时降低按钮的透明度, 而不会改变背景颜色
	let to = <TouchableOpacity onPress={this._onPressButton}>
      <View>
        <Text>TouchableOpacity</Text>
      </View>
    </TouchableOpacity>

    //不显示任何视觉反馈
    let twf = <TouchableWithoutFeedback
        onPress={this._onPressButton}
    >
      <View>
        <Text>TouchableWithoutFeedback</Text>
      </View>
    </TouchableWithoutFeedback>
}